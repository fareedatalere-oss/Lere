"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Loader2,
  Play,
  Video,
  VideoOff,
  UserPlus,
  Type,
  PhoneOff
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

interface VideoChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  incomingCallId?: string;
}

const servers = {
  iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
  iceCandidatePoolSize: 10,
};

export function VideoChatInterface({ isOpen, onClose, receiverId, incomingCallId }: VideoChatInterfaceProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [showKeypad, setShowKeypad] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addNumber, setAddNumber] = useState("");

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callDocRef = useRef<any>(null);
  const voiceNoteRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (isOpen && firestore && user) {
      startMultimediaCall();
    }
    return () => cleanup();
  }, [isOpen, firestore, user]);

  const cleanup = () => {
    if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
    if (pc.current) pc.current.close();
    if (callDocRef.current) updateDoc(callDocRef.current, { status: 'ended' }).catch(() => {});
    setMessages([]);
    setCallStatus("Disconnected");
  };

  const startMultimediaCall = async () => {
    try {
      if (!firestore) return;
      pc.current = new RTCPeerConnection(servers);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      remoteStream.current = new MediaStream();
      
      stream.getTracks().forEach(t => pc.current?.addTrack(t, stream));
      pc.current.ontrack = (e) => e.streams[0].getTracks().forEach(t => remoteStream.current?.addTrack(t));
      
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream.current;

      if (incomingCallId) {
        const callDoc = doc(firestore, "calls", incomingCallId);
        callDocRef.current = callDoc;
        onSnapshot(callDoc, (snap) => { if (snap.data()?.status === 'ended') onClose(); });
        
        const offerSnap = await getDocs(collection(callDoc, "offer"));
        const offer = offerSnap.docs[0]?.data();
        if (offer) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          await updateDoc(callDoc, { answer, status: 'accepted' });
        }
        onSnapshot(collection(callDoc, "callerCandidates"), (s) => s.docChanges().forEach(c => {
          if (c.type === "added") pc.current?.addIceCandidate(new RTCIceCandidate(c.doc.data()));
        }));
        pc.current.onicecandidate = (e) => e.candidate && addDoc(collection(callDoc, "receiverCandidates"), e.candidate.toJSON());
        setCallStatus("Connected");
      } else {
        const callDoc = doc(collection(firestore, "calls"));
        callDocRef.current = callDoc;
        pc.current.onicecandidate = (e) => e.candidate && addDoc(collection(callDoc, "callerCandidates"), e.candidate.toJSON());
        
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        await setDoc(callDoc, { 
          status: 'ringing', 
          callerId: user.phoneNumber, 
          receiverId, 
          callType: 'chat',
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
        onSnapshot(collection(callDoc, "receiverCandidates"), (s) => s.docChanges().forEach(c => {
          if (c.type === "added") pc.current?.addIceCandidate(new RTCIceCandidate(c.doc.data()));
        }));
      }

      // Listen for messages on this call
      onSnapshot(collection(callDocRef.current, "messages"), (s) => {
        const msgs = s.docs.map(d => d.data()).sort((a,b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(msgs);
      });

    } catch (err) {
      console.error(err);
      setCallStatus("Error");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !callDocRef.current) return;
    
    await addDoc(collection(callDocRef.current, "messages"), {
      senderId: user?.phoneNumber,
      text: message,
      type: "text",
      timestamp: serverTimestamp()
    });
    setMessage("");
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleAddMember = async () => {
    if (!addNumber) return;
    toast({ title: "Adding Participant", description: `Ringing ${addNumber}...` });
    // Mesh conferencing would involve additional RTCPeerConnections
    setShowAddMember(false);
    setAddNumber("");
  };

  const startVoiceNote = async () => {
    if (!localStream.current) return;
    voiceNoteRecorder.current = new MediaRecorder(localStream.current);
    voiceNoteRecorder.current.start();
    setIsRecording(true);
  };

  const stopVoiceNote = async () => {
    if (!voiceNoteRecorder.current) return;
    voiceNoteRecorder.current.stop();
    setIsRecording(false);
    toast({ title: "Voice Note Sent" });
    // In a real app, upload blob and send URL. Here we simulate the message entry.
    await addDoc(collection(callDocRef.current, "messages"), {
      senderId: user?.phoneNumber,
      type: "audio",
      timestamp: serverTimestamp()
    });
  };

  const rainbowKeys = [
    { k: "1", c: "bg-red-500" }, { k: "2", c: "bg-orange-500" }, { k: "3", c: "bg-yellow-500" },
    { k: "4", c: "bg-green-500" }, { k: "5", c: "bg-blue-500" }, { k: "6", c: "bg-indigo-500" },
    { k: "7", c: "bg-purple-500" }, { k: "8", c: "bg-pink-500" }, { k: "9", c: "bg-teal-500" },
    { k: "*", c: "bg-slate-700" }, { k: "0", c: "bg-slate-800" }, { k: "#", c: "bg-slate-900" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex flex-col md:flex-row p-2 gap-2 overflow-hidden">
      {/* Video Section */}
      <div className="flex-1 relative bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[40vh] md:min-h-0">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-primary/80 backdrop-blur-md">{callStatus}</Badge>
        </div>
        <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl bg-black">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {isVideoOff && <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><VideoOff className="text-white/40" /></div>}
        </div>
        
        {/* Floating In-Call Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-xl p-3 rounded-full border border-white/10">
          <Button variant="ghost" size="icon" className={`rounded-full h-12 w-12 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`} onClick={toggleMic}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button variant="ghost" size="icon" className={`rounded-full h-12 w-12 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`} onClick={toggleVideo}>
            {isVideoOff ? <VideoOff /> : <Video />}
          </Button>
          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={onClose}>
            <PhoneOff className="h-7 w-7" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/10 text-white" onClick={() => setShowAddMember(true)}>
            <UserPlus />
          </Button>
        </div>
      </div>

      {/* Chat & Interaction Section */}
      <div className="w-full md:w-[400px] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-4 bg-primary text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-bold">Chat Live with {receiverId}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowKeypad(!showKeypad)} className="rounded-full text-white">
            <Type className="h-5 w-5" />
          </Button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 italic text-sm">
              <MessageSquare className="h-10 w-10 mb-2" />
              <p>Say hello!</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.senderId === user?.phoneNumber ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.senderId === user?.phoneNumber ? 'bg-primary text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                  {m.type === 'audio' ? (
                    <div className="flex items-center gap-2"><Play className="h-3 w-3 fill-current" /> <span className="text-[10px] font-bold uppercase">Voice Note</span></div>
                  ) : <p>{m.text}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Interaction Controls */}
        <div className="p-4 bg-white border-t space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-2xl h-12 w-12 shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100'}`}
              onMouseDown={startVoiceNote}
              onMouseUp={stopVoiceNote}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <form className="flex-1 relative" onSubmit={handleSendMessage}>
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="h-12 rounded-2xl bg-slate-100 border-none pr-12 focus-visible:ring-primary/20"
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-primary text-white shadow-md" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Rainbow Keypad (Dynamic Keyboard) */}
          {showKeypad && (
            <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-5">
              {rainbowKeys.map(rk => (
                <Button 
                  key={rk.k} 
                  className={`${rk.c} h-10 rounded-xl text-white font-bold text-lg hover:opacity-80 transition-all active:scale-95`}
                  onClick={() => setMessage(prev => prev + rk.k)}
                >
                  {rk.k}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Add Member Overlay */}
        {showAddMember && (
          <div className="absolute inset-x-0 top-0 bottom-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <h4 className="font-bold text-lg mb-4 text-center">Add to Group Video Chat</h4>
              <Input placeholder="Enter Phone Number" className="h-14 rounded-2xl mb-4 text-center text-xl font-bold" value={addNumber} onChange={(e) => setAddNumber(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="ghost" className="h-12 rounded-2xl" onClick={() => setShowAddMember(false)}>Cancel</Button>
                <Button className="h-12 rounded-2xl bg-primary" onClick={handleAddMember}>Add Now</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
