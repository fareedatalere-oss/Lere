
"use client";

import { useState, useEffect } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
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
  BellRing
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

function DashboardContent() {
  const { user, logout, isLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [isCalling, setIsCalling] = useState<{ 
    isOpen: boolean; 
    type: "voice" | "video";
    receiverId?: string;
    incomingCallId?: string;
  }>({ isOpen: false, type: "voice" });

  const [targetNumber, setTargetNumber] = useState("");
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Listen for incoming calls
  useEffect(() => {
    if (!firestore || !user) return;

    const callsRef = collection(firestore, "calls");
    const q = query(
      callsRef, 
      where("receiverId", "==", user.phoneNumber), 
      where("status", "==", "ringing")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setIncomingCall({ id: change.doc.id, ...change.doc.data() });
        }
      });
    });

    return () => unsubscribe();
  }, [firestore, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleStartCall = (type: "voice" | "video") => {
    if (!targetNumber) {
      alert("Please enter a phone number to call");
      return;
    }
    setIsCalling({ isOpen: true, type, receiverId: targetNumber });
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

  const handleRejectCall = () => {
    if (incomingCall && firestore) {
      const callDoc = doc(firestore, "calls", incomingCall.id);
      updateDoc(callDoc, { status: 'rejected' });
      setIncomingCall(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-xl font-bold text-primary">Lere Connect</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Phone number to call" 
              className="w-40 h-8 text-xs bg-accent/50 border-none rounded-full px-4"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
            />
            <Button size="sm" variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={() => handleStartCall("voice")}>
              <Phone className="h-4 w-4 mr-1" /> Voice
            </Button>
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90" onClick={() => handleStartCall("video")}>
              <Video className="h-4 w-4 mr-1" /> Video
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* User Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 scale-150 rotate-12">
             <CreditCard size={200} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-white/70">Total Balance</CardTitle>
              <div className="text-3xl font-bold tracking-tight">
                ₦{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">My Number</p>
                <p className="text-sm font-mono font-medium">{user.phoneNumber}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Account Number</p>
                <p className="text-sm font-mono font-medium">{user.accountNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Ice-Breaker Tool */}
        <IceBreaker />

        {/* Main Grid Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/actions/airtime-to-cash")}>
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold">Airtime to Cash</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/actions/buy-data")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">Buy Data</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/actions/buy-airtime")}>
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold">Buy Airtime</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/actions/send-money")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">Send Money</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/profile")}>
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </Button>

          <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group" onClick={() => router.push("/contact")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">Contact</span>
          </Button>
        </div>

        <div className="pt-6">
          <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </main>

      {/* Incoming Call Notification */}
      <AlertDialog open={!!incomingCall}>
        <AlertDialogContent className="bg-white border-none shadow-2xl rounded-3xl p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <BellRing className="h-10 w-10 text-primary" />
          </div>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-bold">Incoming {incomingCall?.callType} Call</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {incomingCall?.callerId} is calling you...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 w-full mt-8">
            <AlertDialogCancel 
              onClick={handleRejectCall}
              className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
            >
              Reject
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAcceptCall}
              className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Call UI */}
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

export default function Dashboard() {
  return (
    <UserProvider>
      <DashboardContent />
    </UserProvider>
  );
}
