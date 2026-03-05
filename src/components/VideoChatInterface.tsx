
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
  Play
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

interface VideoChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
}

export function VideoChatInterface({ isOpen, onClose, receiverId }: VideoChatInterfaceProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setMessage("");
    toast({ title: "Sent", description: "Message delivered." });
  };

  const startVoiceNote = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };
      mediaRecorder.current.onstop = () => {
        toast({ title: "Voice Note Sent", description: "Audio delivered." });
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not access microphone." });
    }
  };

  const stopVoiceNote = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    
    const newMsg = {
      id: Date.now(),
      sender: "me",
      type: "audio",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold">{receiverId}</h2>
              <p className="text-[10px] uppercase opacity-70">Video Chat Active</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
              <MessageSquare className="h-12 w-12" />
              <p className="text-sm font-medium">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] ${msg.sender === "me" ? "bg-primary text-white rounded-tr-none" : "bg-white border rounded-tl-none"}`}>
                  {msg.type === "audio" ? (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 fill-current" />
                      <div className="h-1 w-20 bg-white/30 rounded-full" />
                      <span className="text-[10px]">Voice Note</span>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{msg.time}</span>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full h-12 w-12 ${isRecording ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-100'}`}
            onMouseDown={startVoiceNote}
            onMouseUp={stopVoiceNote}
            onTouchStart={startVoiceNote}
            onTouchEnd={stopVoiceNote}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <form className="flex-1 flex items-center gap-2" onSubmit={handleSendMessage}>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="h-12 rounded-2xl bg-slate-50 border-none"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-full bg-primary shadow-md shrink-0"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
