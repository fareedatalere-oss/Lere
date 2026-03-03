
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface CallInterfaceProps {
  type: "voice" | "video";
  isOpen: boolean;
  onClose: () => void;
  contactName?: string;
}

export function CallInterface({ type, isOpen, onClose, contactName = "Remote User" }: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

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
        <div className="absolute top-10 text-center z-10 w-full">
          <h2 className="text-white text-3xl font-bold mb-2">{contactName}</h2>
          <p className="text-secondary font-medium tracking-widest uppercase text-sm">
            {type === "video" ? "Video Calling..." : "Voice Calling..."}
          </p>
          <p className="text-white/60 mt-2 font-mono">{formatTime(callDuration)}</p>
        </div>

        {/* Video View or Avatar */}
        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
          {type === "video" && !isVideoOff ? (
            <div className="relative w-full h-full">
               <Image 
                src="https://picsum.photos/seed/callbg/800/600" 
                alt="Video feed" 
                fill 
                className="object-cover opacity-80"
                data-ai-hint="video call"
              />
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg">
                <Image 
                  src="https://picsum.photos/seed/self/200/300" 
                  alt="Self feed" 
                  fill 
                  className="object-cover"
                  data-ai-hint="profile"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary shadow-[0_0_50px_rgba(34,110,201,0.3)]">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                  <Image 
                    src="https://picsum.photos/seed/user1/200/200" 
                    alt="User" 
                    width={128} 
                    height={128} 
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
              <p className="text-white/50 text-sm">Secure Peer-to-Peer Connection</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-6 my-10 flex items-center justify-evenly shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {type === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
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
