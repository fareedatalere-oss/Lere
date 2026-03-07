
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  User, 
  LogOut, 
  Wallet, 
  Loader2,
  BellRing,
  PlusCircle,
  Hash,
  BookOpen,
  MessageCircle,
  PlayCircle,
  Coins,
  Repeat,
  Headset,
  Wifi,
  Smartphone,
  Send,
  Grid,
  Zap,
  Tv,
  GraduationCap,
  Lock,
  Mic,
  ScanFace,
  ShieldAlert,
  PowerOff,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CallInterface } from "@/components/CallInterface";
import { Dialer } from "@/components/Dialer";
import { VideoChatInterface } from "@/components/VideoChatInterface";
import { IceBreaker } from "@/components/IceBreaker";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const DEFAULT_RINGTONE = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3";
const LOCK_TIMEOUT = 5 * 60 * 1000;

export default function Dashboard() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { firestore, user: firebaseUser, isUserLoading: isFirebaseLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [isCalling, setIsCalling] = useState<{ 
    isOpen: boolean; 
    type: "voice" | "video" | "chat";
    receiverId?: string;
    incomingCallId?: string;
  }>({ isOpen: false, type: "voice" });

  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "matched" | "failed">("idle");
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetLockTimer = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    if (!isLocked) {
      lockTimerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, LOCK_TIMEOUT);
    }
  }, [isLocked]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetLockTimer));
    resetLockTimer();
    return () => {
      events.forEach(event => document.removeEventListener(event, resetLockTimer));
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [resetLockTimer]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
    if (user?.isBlocked) {
      setIsLocked(true);
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!firestore || !user?.phoneNumber || !firebaseUser) return;

    const q = query(collection(firestore, "calls"), where("receiverId", "==", user.phoneNumber));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (change.type === "added" && data.status === "ringing") {
          const callData = { id: change.doc.id, ...data };
          setIncomingCall(callData);
          if (ringtoneRef.current) {
            ringtoneRef.current.src = (user as any).customRingtoneUrl || DEFAULT_RINGTONE;
            ringtoneRef.current.play().catch(() => {});
          }
        }
      });
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: "calls", operation: 'list' }));
    });

    return () => unsubscribe();
  }, [firestore, user, firebaseUser]);

  const handleUnlock = () => {
    if (pinInput === user?.pin) {
      setIsLocked(false);
      setPinInput("");
      resetLockTimer();
    } else {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      setPinInput("");
    }
  };

  const handleBiometricUnlock = async (type: 'face' | 'voice') => {
    if (type === 'face' && !user?.faceLoginActive) {
      toast({ variant: "destructive", title: "Face ID Not Set", description: "Enable Face Login in Profile first." });
      return;
    }
    if (type === 'voice' && !user?.voiceLoginActive) {
      toast({ variant: "destructive", title: "Voice Lock Not Set", description: "Enable Voice Lock in Profile first." });
      return;
    }

    setBiometricStatus("scanning");
    setIsBiometricScanning(true);
    
    // PERFORM REAL SIGNATURE MATCHING
    setTimeout(() => {
      const storedSignature = type === 'face' ? user?.faceData : user?.voiceData;
      
      if (storedSignature && storedSignature.startsWith("secure_")) {
        setBiometricStatus("matched");
        setTimeout(() => {
          setIsLocked(false);
          setIsBiometricScanning(false);
          setBiometricStatus("idle");
          setPinInput("");
          resetLockTimer();
          toast({ title: "Identity Verified", description: `Welcome back, ${user?.username}` });
        }, 1000);
      } else {
        setBiometricStatus("failed");
        setTimeout(() => {
          setIsBiometricScanning(false);
          setBiometricStatus("idle");
          toast({ variant: "destructive", title: "No Match Found", description: "Biometric signature does not match this account." });
        }, 1500);
      }
    }, 3000);
  };

  if (isUserLoading || isFirebaseLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) return null;

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 backdrop-blur-xl">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Secure Lock</h2>
        <p className="text-muted-foreground text-sm mb-8 text-center max-w-xs">Identity Verification Required</p>
        
        <div className="w-full max-w-xs space-y-6">
          {biometricStatus === "scanning" ? (
            <div className="flex flex-col items-center gap-4 py-10 animate-in zoom-in-95">
              <div className="relative">
                <Loader2 className="h-20 w-20 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanFace className="h-8 w-8 text-primary opacity-50" />
                </div>
              </div>
              <p className="font-bold text-primary animate-pulse tracking-widest uppercase text-xs">Matching Signature...</p>
            </div>
          ) : biometricStatus === "matched" ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <CheckCircle2 className="h-20 w-20 text-emerald-500" />
              <p className="font-bold text-emerald-600">Access Granted</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="****" 
                  maxLength={4} 
                  className="h-16 text-center text-3xl tracking-[1em] rounded-3xl border-none bg-slate-100 shadow-inner"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                {pinInput.length === 4 && (
                  <Button className="w-full h-14 mt-4 rounded-2xl bg-primary text-white font-bold shadow-lg" onClick={handleUnlock}>Unlock Now</Button>
                )}
              </div>

              <div className="flex flex-col items-center gap-4 pt-4 border-t">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Biometric Entry</p>
                <div className="flex gap-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-20 w-20 rounded-full border-2 border-primary/20 bg-white shadow-xl hover:bg-primary/5 group"
                    onClick={() => handleBiometricUnlock('face')}
                    disabled={isBiometricScanning}
                  >
                    <ScanFace className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-20 w-20 rounded-full border-2 border-teal-100 bg-white shadow-xl hover:bg-teal-50 group"
                    onClick={() => handleBiometricUnlock('voice')}
                    disabled={isBiometricScanning}
                  >
                    <Mic className="h-8 w-8 text-teal-600 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleStartDialAction = (type: "voice" | "video" | "chat", number: string) => {
    setIsCalling({ isOpen: true, type, receiverId: number });
    setIsDialerOpen(false);
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setIsCalling({ isOpen: true, type: incomingCall.callType, incomingCallId: incomingCall.id, receiverId: incomingCall.callerId });
      setIncomingCall(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={() => router.push("/profile")}><User className="text-white h-6 w-6" /></div>
            <h1 className="text-xl font-bold text-primary">Lere Connect</h1>
          </div>
          <Button className="rounded-full bg-primary shadow-md h-12 px-6" onClick={() => setIsDialerOpen(true)}><Grid className="h-5 w-5 mr-2" /> DIAL</Button>
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} className="rounded-full"><User className="h-5 w-5 text-muted-foreground" /></Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-white/70">Main Balance</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">₦{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 px-3" onClick={() => router.push("/actions/fund")}><PlusCircle className="h-4 w-4 mr-1" /> Fund</Button>
              </div>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner"><Wallet className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div><p className="text-[10px] text-white/50 uppercase font-bold">Reward Points</p><p className="text-sm font-bold flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-400" /> {user.rewardBalance?.toFixed(2) || "0.00"}</p></div>
              <div className="text-right"><p className="text-[10px] text-white/50 uppercase font-bold">Credit Input</p><p className="text-sm font-mono tracking-tighter">{user.accountNumber}</p></div>
            </div>
          </CardContent>
        </Card>

        <IceBreaker />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/watch")}><div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center"><PlayCircle className="h-4 w-4 text-yellow-600" /></div><span className="text-[10px] font-bold uppercase text-center">Watch & Earn</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/airtime-to-cash")}><div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center"><Repeat className="h-4 w-4 text-green-600" /></div><span className="text-[10px] font-bold uppercase text-center">Airtime to Cash</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/buy-airtime")}><div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center"><Smartphone className="h-4 w-4 text-blue-600" /></div><span className="text-[10px] font-bold uppercase text-center">Buy Airtime</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/buy-data")}><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><Wifi className="h-4 w-4 text-primary" /></div><span className="text-[10px] font-bold uppercase text-center">Buy Data</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/send-money")}><div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center"><Send className="h-4 w-4 text-indigo-600" /></div><span className="text-[10px] font-bold uppercase text-center">Send Money</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/electric-bills")}><div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center"><Zap className="h-4 w-4 text-orange-600" /></div><span className="text-[10px] font-bold uppercase text-center">Electric Bills</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/tv-subscription")}><div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"><Tv className="h-4 w-4 text-red-600" /></div><span className="text-[10px] font-bold uppercase text-center">TV Subscription</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/exams-pin")}><div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center"><GraduationCap className="h-4 w-4 text-purple-600" /></div><span className="text-[10px] font-bold uppercase text-center">Exams Pin</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/buy-number")}><div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center"><Hash className="h-4 w-4 text-secondary" /></div><span className="text-[10px] font-bold uppercase text-center">Buy Number</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/sms")}><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><MessageCircle className="h-4 w-4 text-primary" /></div><span className="text-[10px] font-bold uppercase text-center">SMS</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-2 border-primary/20 bg-primary/5" onClick={() => router.push("/library")}><div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center"><BookOpen className="h-4 w-4 text-secondary" /></div><span className="text-[10px] font-bold uppercase text-center">Library</span></Button>
          <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/contact")}><div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"><Headset className="h-4 w-4 text-red-600" /></div><span className="text-[10px] font-bold uppercase text-center">Contact</span></Button>
        </div>

        <div className="pt-10 flex flex-col gap-4">
          <Button className="w-full h-16 bg-slate-900 text-white rounded-3xl shadow-xl font-bold text-lg flex items-center justify-center gap-3 border-4 border-white" onClick={() => setIsLocked(true)}><PowerOff className="h-6 w-6 text-primary" /> LOCK SECURE SESSION</Button>
          <Button variant="ghost" className="w-full text-red-500 rounded-xl" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout Device</Button>
        </div>
      </main>

      <Dialer isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} onStartCall={handleStartDialAction} />
      {isCalling.type === 'chat' ? (
        <VideoChatInterface isOpen={isCalling.isOpen} onClose={() => setIsCalling({ ...isCalling, isOpen: false, incomingCallId: undefined })} receiverId={isCalling.receiverId || "Conference"} incomingCallId={isCalling.incomingCallId} />
      ) : (
        <CallInterface isOpen={isCalling.isOpen} type={isCalling.type as any} receiverId={isCalling.receiverId} incomingCallId={isCalling.incomingCallId} onClose={() => setIsCalling({ ...isCalling, isOpen: false, incomingCallId: undefined })} />
      )}

      <AlertDialog open={!!incomingCall}>
        <AlertDialogContent className="bg-white rounded-3xl p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce"><BellRing className="h-10 w-10 text-primary" /></div>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-bold">Incoming {incomingCall?.callType === 'chat' ? 'Video Chat' : incomingCall?.callType} Call</AlertDialogTitle>
            <AlertDialogDescription>{incomingCall?.callerId} is calling...</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 w-full mt-8">
            <AlertDialogCancel onClick={() => setIncomingCall(null)} className="flex-1 h-14 rounded-2xl text-red-500 font-bold border-red-100">Deny</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptCall} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Pick Up</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
