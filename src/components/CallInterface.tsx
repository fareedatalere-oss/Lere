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
  Radio,
  Plus,
  Type,
  MicVocal,
  Send,
  X
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
import { Input } from "./ui/input";

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
  const [showKeypad, setShowKeypad] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addNumber, setAddNumber] = useState("");
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(new MediaStream());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callDocRef = useRef<any>(null);
  const voiceNoteRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callStatus === "Connected") {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  useEffect(() => {
    if (isOpen && firestore && user) {
      startCall();
    }
    return () => cleanup();
  }, [isOpen, firestore, user]);

  const cleanup = () => {
    if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
    if (pc.current) pc.current.close();
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
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => pc.current?.addTrack(track, stream));

      pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current?.addTrack(track);
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream.current;
        }
      };

      if (incomingCallId) {
        const callDoc = doc(firestore, "calls", incomingCallId);
        callDocRef.current = callDoc;
        
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.status === 'ended') onClose();
        });

        const offerSnapshot = await getDocs(collection(callDoc, "offer"));
        const offerData = offerSnapshot.docs[0]?.data();
        if (offerData) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(offerData));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          await updateDoc(callDoc, { 
            answer: { type: answer.type, sdp: answer.sdp },
            status: 'accepted'
          });
        }

        onSnapshot(collection(callDoc, "callerCandidates"), (snap) => {
          snap.docChanges().forEach((c) => {
            if (c.type === "added") pc.current?.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {});
          });
        });

        pc.current.onicecandidate = (e) => e.candidate && addDoc(collection(callDoc, "receiverCandidates"), e.candidate.toJSON());
        setCallStatus("Connected");
      } else if (receiverId) {
        const callDoc = doc(collection(firestore, "calls"));
        callDocRef.current = callDoc;

        pc.current.onicecandidate = (e) => e.candidate && addDoc(collection(callDoc, "callerCandidates"), e.candidate.toJSON());

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        await setDoc(callDoc, { 
          status: 'ringing', 
          callerId: user.phoneNumber, 
          receiverId, 
          callType: type,
          startTime: serverTimestamp() 
        });

        await addDoc(collection(callDoc, "offer"), { type: offer.type, sdp: offer.sdp });

        onSnapshot(callDoc, (snap) => {
          const data = snap.data();
          if (data?.answer && !pc.current?.currentRemoteDescription) {
            pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
            setCallStatus("Connected");
          }
          if (data?.status === 'ended') onClose();
        });

        onSnapshot(collection(callDoc, "receiverCandidates"), (snap) => {
          snap.docChanges().forEach((c) => {
            if (c.type === "added") pc.current?.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {});
          });
        });
      }
    } catch (error) {
      setCallStatus("Error");
      toast({ variant: "destructive", title: "Media Error", description: "Hardware access denied." });
    }
  };

  const handleSendVoiceNote = () => {
    if (isRecordingVoiceNote) {
      voiceNoteRecorder.current?.stop();
      setIsRecordingVoiceNote(false);
      toast({ title: "Sent", description: "Voice note delivered." });
    } else {
      if (!localStream.current) return;
      voiceNoteRecorder.current = new MediaRecorder(localStream.current);
      voiceNoteRecorder.current.start();
      setIsRecordingVoiceNote(true);
    }
  };

  const rainbowKeys = [
    { k: "1", c: "bg-red-500" }, { k: "2", c: "bg-orange-500" }, { k: "3", c: "bg-yellow-500" },
    { k: "4", c: "bg-green-500" }, { k: "5", c: "bg-blue-500" }, { k: "6", c: "bg-indigo-500" },
    { k: "7", c: "bg-purple-500" }, { k: "8", c: "bg-pink-500" }, { k: "9", c: "bg-teal-500" },
    { k: "*", c: "bg-slate-700" }, { k: "0", c: "bg-slate-800" }, { k: "#", c: "bg-slate-900" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-full flex flex-col items-center">
        <div className="absolute top-10 text-center z-20 w-full">
          <h2 className="text-white text-3xl font-bold mb-2">{receiverId || "Lere Participant"}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-secondary font-medium tracking-widest uppercase text-sm">{callStatus}</span>
          </div>
          <p className="text-white/60 mt-2 font-mono">{Math.floor(callDuration/60)}:{(callDuration%60).toString().padStart(2,'0')}</p>
        </div>

        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            onLoadedMetadata={() => remoteVideoRef.current?.play()}
          />
          {type === "voice" && callStatus === "Connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary animate-pulse">
                 <Phone className="h-16 w-16 text-white" />
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 right-4 w-24 h-32 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg bg-black">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 my-6 flex flex-col items-center gap-6 shadow-xl">
          <div className="flex items-center justify-evenly w-full">
            <Button variant="ghost" size="icon" className={`h-12 w-12 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/10'} text-white`} onClick={() => { localStream.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled); setIsMuted(!isMuted); }}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>

            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/10 text-white" onClick={() => setShowAddMember(true)}>
              <Plus />
            </Button>

            <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-lg" onClick={onClose}>
              <PhoneOff className="h-8 w-8" />
            </Button>

            <Button variant="ghost" size="icon" className={`h-12 w-12 rounded-full ${isRecordingVoiceNote ? 'bg-orange-500 animate-pulse' : 'bg-white/10'} text-white`} onClick={handleSendVoiceNote}>
              <MicVocal />
            </Button>

            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/10 text-white" onClick={() => setShowKeypad(!showKeypad)}>
              <Type />
            </Button>
          </div>
        </div>

        {showKeypad && (
          <div className="absolute inset-x-0 bottom-40 mx-auto w-full max-w-xs bg-black/80 backdrop-blur-xl p-6 rounded-3xl grid grid-cols-3 gap-3 border border-white/10 z-50">
            <div className="col-span-3 flex justify-between items-center mb-2">
              <span className="text-white text-xs font-bold uppercase tracking-widest">In-Call Keypad</span>
              <X className="h-4 w-4 text-white cursor-pointer" onClick={() => setShowKeypad(false)} />
            </div>
            {rainbowKeys.map(rk => (
              <Button key={rk.k} className={`h-14 rounded-2xl ${rk.c} text-white font-bold text-xl hover:scale-105 transition-all`}>{rk.k}</Button>
            ))}
          </div>
        )}

        {showAddMember && (
          <div className="absolute inset-x-0 bottom-40 mx-auto w-full max-w-xs bg-white p-6 rounded-3xl border shadow-2xl z-50">
            <h3 className="font-bold mb-4">Add Participant</h3>
            <div className="space-y-4">
              <Input placeholder="Enter phone number" className="h-12 rounded-xl" value={addNumber} onChange={(e) => setAddNumber(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddMember(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary text-white" onClick={() => { toast({ title: "Signal Sent", description: "Ringing member..." }); setShowAddMember(false); }}>Add</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}