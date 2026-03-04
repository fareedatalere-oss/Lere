
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDocs,
  limit
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  Video, 
  Send, 
  Smartphone, 
  Wifi, 
  CreditCard, 
  User, 
  MessageSquare, 
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
  Headset
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CallInterface } from "@/components/CallInterface";
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

export default function Dashboard() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { firestore, user: firebaseUser, isUserLoading: isFirebaseLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [isCalling, setIsCalling] = useState<{ 
    isOpen: boolean; 
    type: "voice" | "video";
    receiverId?: string;
    incomingCallId?: string;
  }>({ isOpen: false, type: "voice" });

  const [targetNumber, setTargetNumber] = useState("");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!firestore || !user?.phoneNumber || !firebaseUser) return;

    const callsRef = collection(firestore, "calls");
    const q = query(
      callsRef, 
      where("receiverId", "==", user.phoneNumber), 
      where("status", "==", "ringing")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const callData = { id: change.doc.id, ...change.doc.data() };
          setIncomingCall(callData);
        }
      });
    }, async (error) => {
      const permissionError = new FirestorePermissionError({
        path: "calls",
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [firestore, user, firebaseUser]);

  if (isUserLoading || isFirebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleStartCall = async (type: "voice" | "video") => {
    if (!targetNumber) {
      toast({ variant: "destructive", title: "Number Required", description: "Please enter a phone number." });
      return;
    }
    setIsValidating(true);
    try {
      const usersRef = collection(firestore!, "users");
      const q = query(usersRef, where("phoneNumber", "==", targetNumber), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Not Registered", description: "This number isn't yet registered." });
        setIsValidating(false);
        return;
      }
      setIsCalling({ isOpen: true, type, receiverId: targetNumber });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to verify number." });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setIsCalling({ 
        isOpen: true, 
        type: incomingCall.callType, 
        incomingCallId: incomingCall.id,
        receiverId: incomingCall.callerId
      });
      setIncomingCall(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={() => router.push("/profile")}>
              <User className="text-white h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-primary hidden sm:block">Lere Connect</h1>
          </div>
          
          <div className="flex flex-1 max-w-md items-center gap-2 bg-accent/30 p-1 rounded-full border border-primary/10">
            <Input 
              placeholder="Enter number..." 
              className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              disabled={isValidating}
            />
            <div className="flex gap-1 pr-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-primary" onClick={() => handleStartCall("voice")}>
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              </Button>
              <Button size="sm" className="h-8 px-3 rounded-full bg-primary" onClick={() => handleStartCall("video")}>
                <Video className="h-4 w-4 mr-1" /> CALL
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} className="rounded-full">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl text-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-white/70">Main Balance</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">₦{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 px-3" onClick={() => router.push("/actions/fund")}>
                  <PlusCircle className="h-4 w-4" /> Fund
                </Button>
              </div>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <div>
                <p className="text-[10px] text-white/50 uppercase">Reward Points</p>
                <p className="text-sm font-bold flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-400" /> {user.rewardBalance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase">Credit Input</p>
                <p className="text-sm font-mono">{user.accountNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <IceBreaker />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/watch")}>
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-xs font-semibold text-center">Watch & Earn</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/airtime-to-cash")}>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Repeat className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-center">Airtime to Cash</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/buy-data")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-center">Buy Data</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/buy-number")}>
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Hash className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold text-center">Buy Number</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/sms")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-center">SMS</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/library")}>
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold text-center">Library</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/profile")}>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-xs font-semibold text-center">Profile</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md" onClick={() => router.push("/actions/contact")}>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Headset className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-xs font-semibold text-center">Contact</span>
          </Button>
        </div>

        <div className="pt-6">
          <Button variant="ghost" className="w-full text-red-500 rounded-xl" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </main>

      <AlertDialog open={!!incomingCall}>
        <AlertDialogContent className="bg-white rounded-3xl p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <BellRing className="h-10 w-10 text-primary" />
          </div>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-bold">Incoming {incomingCall?.callType} Call</AlertDialogTitle>
            <AlertDialogDescription>{incomingCall?.callerId} is calling...</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 w-full mt-8">
            <AlertDialogCancel onClick={() => setIncomingCall(null)} className="flex-1 h-14 rounded-2xl text-red-500 font-bold">Deny</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptCall} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Pick Up</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CallInterface 
        isOpen={isCalling.isOpen} 
        type={isCalling.type} 
        receiverId={isCalling.receiverId}
        incomingCallId={isCalling.incomingCallId}
        onClose={() => setIsCalling({ ...isCalling, isOpen: false, incomingCallId: undefined })} 
      />
    </div>
  );
}
