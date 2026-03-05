
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  Video, 
  Delete, 
  History, 
  Loader2,
  Clock,
  Trash2,
  MessageSquare,
  X
} from "lucide-react";

interface DialerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: "voice" | "video" | "chat", number: string) => void;
}

export function Dialer({ isOpen, onClose, onStartCall }: DialerProps) {
  const [number, setNumber] = useState("");
  const [recentCalls, setRecentCalls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("recent_dials");
      if (saved) setRecentCalls(JSON.parse(saved));
    }
  }, [isOpen]);

  const saveToRecent = (num: string) => {
    if (!num) return;
    const updated = [num, ...recentCalls.filter(n => n !== num)].slice(0, 10);
    setRecentCalls(updated);
    localStorage.setItem("recent_dials", JSON.stringify(updated));
  };

  const deleteRecent = (num: string) => {
    const updated = recentCalls.filter(n => n !== num);
    setRecentCalls(updated);
    localStorage.setItem("recent_dials", JSON.stringify(updated));
  };

  const addDigit = (digit: string) => {
    if (number.length < 15) setNumber(prev => prev + digit);
  };

  const removeDigit = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleAction = (type: "voice" | "video" | "chat") => {
    if (!number) return;
    saveToRecent(number);
    onStartCall(type, number);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-3xl border-none">
        <DialogHeader className="p-6 bg-primary text-white">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5" /> Dial Center
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input 
                value={number}
                readOnly
                className="text-center text-3xl font-bold h-16 border-none bg-accent/30 rounded-2xl focus-visible:ring-0"
                placeholder="000 000 0000"
              />
              {number && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={removeDigit}
                >
                  <Delete className="h-6 w-6 text-muted-foreground" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Recent Activity (Browser)
              </p>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                {recentCalls.length > 0 ? (
                  recentCalls.map((num, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-accent/10 rounded-xl">
                      <Button 
                        variant="ghost" 
                        className="flex-1 justify-start font-mono font-bold h-8"
                        onClick={() => setNumber(num)}
                      >
                        {num}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => deleteRecent(num)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-1">No history found</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 justify-items-center">
            {keys.map(k => (
              <Button 
                key={k} 
                variant="ghost" 
                className="h-14 w-14 rounded-full text-xl font-bold hover:bg-primary/10 active:scale-90 transition-all border shadow-sm"
                onClick={() => addDigit(k)}
              >
                {k}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button 
              className="h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-lg flex flex-col items-center justify-center p-0"
              onClick={() => handleAction("voice")}
              disabled={!number}
            >
              <Phone className="h-5 w-5 mb-1" /> VOICE
            </Button>
            <Button 
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg flex flex-col items-center justify-center p-0"
              onClick={() => handleAction("video")}
              disabled={!number}
            >
              <Video className="h-5 w-5 mb-1" /> VIDEO
            </Button>
            <Button 
              className="h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-lg flex flex-col items-center justify-center p-0"
              onClick={() => handleAction("chat")}
              disabled={!number}
            >
              <MessageSquare className="h-5 w-5 mb-1" /> CHAT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
