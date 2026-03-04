
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import Image from "next/image";

interface CallInterfaceProps {
  type: "voice" | "video";
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
  incomingCallId?: string;
}

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function CallInterface({ type, isOpen, onClose, receiverId, incomingCallId }: CallInterfaceProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<string>("Connecting...");
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callDocRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callStatus === "Connected") {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  useEffect(() => {
    if (isOpen && firestore && user) {
      startCall();
    }
    return () => {
      cleanup();
    };
  }, [isOpen, firestore, user]);

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (callDocRef.current) {
      updateDoc(callDocRef.current, { status: 'ended', endTime: serverTimestamp() }).catch(() => {});
    }
    setCallStatus("Disconnected");
    setCallDuration(0);
  };

  const startCall = async () => {
    try {
      if (!firestore) return;

      pc.current = new RTCPeerConnection(servers);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      localStream.current = stream;
      remoteStream.current = new MediaStream();

      stream.getTracks().forEach((track) => {
        if (pc.current && localStream.current) {
          pc.current.addTrack(track, localStream.current);
        }
      });

      pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          if (remoteStream.current) {
            remoteStream.current.addTrack(track);
          }
        });
      };

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream.current;

      if (incomingCallId) {
        // Handle Answer Mode
        const callDoc = doc(firestore, "calls", incomingCallId);
        callDocRef.current = callDoc;
        
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.status === 'ended') {
            onClose();
          }
        });

        const offerDescription = (await (await getDocs(collection(callDoc, "offer"))).docs[0]?.data())?.sdp;
        if (!offerDescription) {
          // Alternative: offer is on the doc itself
          const data = (await (await getDocs(collection(firestore, "calls"))).docs.find(d => d.id === incomingCallId))?.data();
          if (data?.offer) {
            await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answerDescription = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answerDescription);
            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            await updateDoc(callDoc, { answer, status: 'accepted' });
          }
        }

        const callerCandidates = collection(callDoc, "callerCandidates");
        onSnapshot(callerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && pc.current) {
              const data = change.doc.data();
              pc.current.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(collection(callDoc, "receiverCandidates"), event.candidate.toJSON());
          }
        };

        setCallStatus("Connected");
      } else if (receiverId) {
        // Handle Call Mode
        const callDoc = doc(collection(firestore, "calls"));
        callDocRef.current = callDoc;

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(collection(callDoc, "callerCandidates"), event.candidate.toJSON());
          }
        };

        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        };

        await setDoc(callDoc, { 
          offer, 
          status: 'ringing', 
          callerId: user.phoneNumber, 
          receiverId, 
          callType: type,
          startTime: serverTimestamp() 
        });

        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.answer && pc.current && !pc.current.currentRemoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.current.setRemoteDescription(answerDescription);
            setCallStatus("Connected");
          }
          if (data?.status === 'ended' || data?.status === 'rejected') {
            onClose();
          }
        });

        const receiverCandidates = collection(callDoc, "receiverCandidates");
        onSnapshot(receiverCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && pc.current) {
              const data = change.doc.data();
              pc.current.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
      }

    } catch (error) {
      console.error("WebRTC Error:", error);
      setCallStatus("Error connecting");
      setHasCameraPermission(false);
    }
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current && type === 'video') {
      localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-full flex flex-col items-center">
        {/* Call Info */}
        <div className="absolute top-10 text-center z-20 w-full">
          <h2 className="text-white text-3xl font-bold mb-2">{receiverId || "Connected User"}</h2>
          <p className="text-secondary font-medium tracking-widest uppercase text-sm">
            {callStatus}
          </p>
          <p className="text-white/60 mt-2 font-mono">{formatTime(callDuration)}</p>
        </div>

        {/* Video View or Avatar */}
        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
          {type === "video" ? (
            <div className="relative w-full h-full">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg bg-black">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary animate-pulse shadow-[0_0_50px_rgba(34,110,201,0.3)]">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                  <Phone className="h-16 w-16 text-white" />
                </div>
              </div>
              <p className="text-white/50 text-sm">Encrypted Connection</p>
              <audio ref={remoteVideoRef} autoPlay />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-6 my-10 flex items-center justify-evenly shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {type === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={onClose}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
