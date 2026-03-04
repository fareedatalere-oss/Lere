
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
  User, 
  Loader2,
  Clock
} from "lucide-react";
import { useFirebase } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";
import { useUser } from "@/context/UserContext";

interface DialerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: "voice" | "video", number: string) => void;
}

export function Dialer({ isOpen, onClose, onStartCall }: DialerProps) {
  const [number, setNumber] = useState("");
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();

  useEffect(() => {
    if (isOpen && firestore && user) {
      fetchHistory();
    }
  }, [isOpen, firestore, user]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(firestore!, "calls"),
        where("callerId", "==", user!.phoneNumber),
        orderBy("startTime", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentCalls(calls);
    } catch (err) {
      console.error("History fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addDigit = (digit: string) => {
    if (number.length < 15) setNumber(prev => prev + digit);
  };

  const removeDigit = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-3xl border-none">
        <DialogHeader className="p-6 bg-primary text-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5" /> Dial Center
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Display & Recent */}
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
                <Clock className="h-3 w-3" /> Recent Calls
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : recentCalls.length > 0 ? (
                  recentCalls.map((call, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="rounded-full h-10 px-4 shrink-0 bg-accent/20 border-none"
                      onClick={() => setNumber(call.receiverId)}
                    >
                      {call.receiverId}
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {keys.map(k => (
              <Button 
                key={k} 
                variant="ghost" 
                className="h-16 w-16 rounded-full text-2xl font-bold hover:bg-primary/10 active:scale-90 transition-all"
                onClick={() => addDigit(k)}
              >
                {k}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              className="flex-1 h-16 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg"
              onClick={() => onStartCall("voice", number)}
              disabled={!number}
            >
              <Phone className="h-6 w-6 mr-2" /> Voice
            </Button>
            <Button 
              className="flex-1 h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg"
              onClick={() => onStartCall("video", number)}
              disabled={!number}
            >
              <Video className="h-6 w-6 mr-2" /> Video
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
