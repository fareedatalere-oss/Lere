
"use client";

import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Trash2, 
  Music, 
  Loader2, 
  Clock,
  History,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Smartphone,
  ScanFace,
  MicVocal,
  Copy,
  LogOut,
  ShieldAlert,
  Mic,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useMemo } from "react";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { doc, updateDoc, collection, query, where, deleteDoc } from "firebase/firestore";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user, logout } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const txQuery = useMemoFirebase(() => {
    if (!firestore || !user?.id) return null;
    return query(
      collection(firestore, "transactions"),
      where("userId", "==", user.id)
    );
  }, [firestore, user]);
  
  const { data: transactions, isLoading: isTxLoading } = useCollection(txQuery);

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [transactions]);

  if (!user) return null;

  const handleDeleteTx = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "transactions", id));
      toast({ title: "Record Deleted", description: "Transaction record removed." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not delete record." });
    }
  };

  const handleRingtoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('audio/')) return;
    setIsUpdating(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        if (user.id && firestore) {
          await updateDoc(doc(firestore, "users", user.id), { customRingtoneUrl: base64Audio });
          toast({ title: "Ringtone Updated", description: "Your custom ringing tone is now active." });
        }
        setIsUpdating(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUpdating(false);
      toast({ variant: "destructive", title: "Error", description: "Failed to upload audio." });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const handleDisableBiometric = async (type: 'face' | 'voice') => {
    if (!user.id || !firestore) return;
    setIsUpdating(true);
    try {
      const updates = type === 'face' 
        ? { faceLoginActive: false, faceData: null } 
        : { voiceLoginActive: false, voiceData: null };
      await updateDoc(doc(firestore, "users", user.id), updates);
      toast({ title: "Biometric Disabled", description: `${type === 'face' ? 'Face' : 'Voice'} login has been removed.` });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Account Center</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile/settings")}>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-3 pb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
              <User className="h-16 w-16 text-primary" />
            </div>
            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md" onClick={handleRingtoneClick}>
               <Music className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground font-mono text-sm">{user.phoneNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Credit Input</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-bold text-primary">{user.accountNumber}</span>
                <Copy className="h-3 w-3 cursor-pointer opacity-50" onClick={() => copyToClipboard(user.accountNumber, "Account Number")} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-secondary/5">
            <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Referral Code</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-secondary">{user.myReferralCode || "NONE"}</span>
                <Copy className="h-3 w-3 cursor-pointer opacity-50" onClick={() => copyToClipboard(user.myReferralCode || "", "Referral Code")} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Settings & Security</h3>
          <Card className="border-none shadow-sm overflow-hidden divide-y rounded-2xl">
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all text-left" onClick={() => router.push("/actions/buy-number")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Buy New Number</p>
                  <p className="text-[10px] text-muted-foreground">Get a dedicated global line</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Face Login */}
            <div className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                  <ScanFace className="h-5 w-5" />
                </div>
                <div onClick={() => !user.faceLoginActive && !user.voiceLoginActive && router.push("/profile/face-setup")}>
                  <p className="text-sm font-bold">Face Login</p>
                  <p className="text-[10px] text-muted-foreground">{user.faceLoginActive ? 'Biometric enabled' : 'Secure biometric entry'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.faceLoginActive ? (
                  <Button variant="ghost" size="sm" onClick={() => handleDisableBiometric('face')} className="text-red-500 h-8 px-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <span className="text-[10px] font-bold text-primary uppercase">OFF</span>
                )}
              </div>
            </div>

            {/* Voice Lock */}
            <div className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center">
                  <MicVocal className="h-5 w-5" />
                </div>
                <div onClick={() => !user.voiceLoginActive && !user.faceLoginActive && router.push("/profile/voice-setup")}>
                  <p className="text-sm font-bold">Voice Lock</p>
                  <p className="text-[10px] text-muted-foreground">{user.voiceLoginActive ? 'Voice print active' : 'Unlock with voice print'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.voiceLoginActive ? (
                  <Button variant="ghost" size="sm" onClick={() => handleDisableBiometric('voice')} className="text-red-500 h-8 px-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <span className="text-[10px] font-bold text-primary uppercase">OFF</span>
                )}
              </div>
            </div>

            <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all text-left" onClick={() => router.push("/profile/settings")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">General Settings</p>
                  <p className="text-[10px] text-muted-foreground">App preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all text-left" onClick={handleRingtoneClick} disabled={isUpdating}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                  {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold">Choose Ringing Tone</p>
                  <p className="text-[10px] text-muted-foreground">Set custom call audio</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" />
          </Card>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 pt-2 flex items-center gap-2">
            <History className="h-3 w-3" /> Transaction History
          </h3>
          
          <div className="space-y-3">
            {isTxLoading ? (
              <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : sortedTransactions.length > 0 ? (
              sortedTransactions.map(tx => (
                <Card key={tx.id} className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === "Success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {tx.status === "Success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-bold">₦{tx.total?.toLocaleString() || tx.amount?.toLocaleString()}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteTx(tx.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-none shadow-sm bg-slate-50 p-10 text-center rounded-3xl">
                <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-muted-foreground">No transactions recorded yet.</p>
              </Card>
            )}
          </div>

          <div className="pt-6 space-y-3">
            <Button variant="outline" className="w-full h-14 rounded-2xl text-primary font-bold border-primary/20" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout Session
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full h-14 text-red-500 rounded-2xl hover:bg-red-50 font-bold">
                  <ShieldAlert className="h-4 w-4 mr-2" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 text-white rounded-xl hover:bg-red-600">Delete Permanently</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
