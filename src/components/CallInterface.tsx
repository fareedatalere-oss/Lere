
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Video, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff, 
  Volume2, 
  Loader2,
  CircleStop,
  Radio
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<string>("Connecting...");
  const [isRecording, setIsRecording] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callDocRef = useRef<any>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

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
    if (isRecording) stopRecording();
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
        // Answer Mode
        const callDoc = doc(firestore, "calls", incomingCallId);
        callDocRef.current = callDoc;
        
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.status === 'ended' || data?.status === 'rejected') {
            onClose();
          }
        });

        const callSnapshot = await getDocs(collection(callDoc, "offer"));
        const offerData = callSnapshot.docs[0]?.data();
        
        if (offerData) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(offerData));
          const answerDescription = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answerDescription);
          await updateDoc(callDoc, { 
            answer: { type: answerDescription.type, sdp: answerDescription.sdp },
            status: 'accepted'
          });
        }

        const callerCandidates = collection(callDoc, "callerCandidates");
        onSnapshot(callerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && pc.current) {
              pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
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
        // Call Mode
        const callDoc = doc(collection(firestore, "calls"));
        callDocRef.current = callDoc;

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(collection(callDoc, "callerCandidates"), event.candidate.toJSON());
          }
        };

        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        await setDoc(callDoc, { 
          status: 'ringing', 
          callerId: user.phoneNumber, 
          receiverId, 
          callType: type,
          startTime: serverTimestamp() 
        });
        await addDoc(collection(callDoc, "offer"), {
          type: offerDescription.type,
          sdp: offerDescription.sdp
        });

        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.answer && pc.current && !pc.current.currentRemoteDescription) {
            pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
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
              pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });
      }

    } catch (error) {
      console.error("WebRTC Error:", error);
      setCallStatus("Error connecting");
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Could not establish connection. Check permissions.",
      });
    }
  };

  const startRecording = () => {
    if (!localStream.current || !remoteStream.current) return;

    const combinedStream = new MediaStream([
      ...localStream.current.getTracks(),
      ...remoteStream.current.getTracks()
    ]);

    const options = { mimeType: type === 'video' ? 'video/webm' : 'audio/webm' };
    mediaRecorder.current = new MediaRecorder(combinedStream, options);
    
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { 
        type: type === 'video' ? 'video/webm' : 'audio/webm' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LereConnect_${type}_${new Date().getTime()}.webm`;
      a.click();
      recordedChunks.current = [];
    };

    mediaRecorder.current.start();
    setIsRecording(true);
    toast({ title: "Recording Started", description: "Your call is being recorded." });
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      toast({ title: "Recording Saved", description: "File saved to your device." });
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
          <h2 className="text-white text-3xl font-bold mb-2">{receiverId || "Lere User"}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-secondary font-medium tracking-widest uppercase text-sm">
              {callStatus}
            </span>
            {isRecording && <Radio className="h-4 w-4 text-red-500 animate-pulse" />}
          </div>
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
              <audio ref={remoteVideoRef} autoPlay />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 my-10 flex flex-col items-center gap-6 shadow-xl">
          <div className="flex items-center justify-evenly w-full">
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </Button>

            {type === "video" && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-14 w-14 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff /> : <Video />}
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
              className={`h-14 w-14 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <CircleStop /> : <Radio />}
            </Button>
          </div>
          
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">
            {isRecording ? "Recording in progress" : "Secure P2P Connection"}
          </p>
        </div>
      </div>
    </div>
  );
}
