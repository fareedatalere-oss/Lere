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
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { doc, updateDoc, collection, query, where, orderBy, deleteDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch transactions
  const txQuery = useMemoFirebase(() => {
    if (!firestore || !user?.id) return null;
    return query(
      collection(firestore, "transactions"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );
  }, [firestore, user]);
  const { data: transactions, isLoading: isTxLoading } = useCollection(txQuery);

  if (!user) return null;

  const handleDeleteTx = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "transactions", id));
      toast({ title: "Record Deleted", description: "Transaction has been removed from your history." });
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
          toast({ title: "Ringtone Updated", description: "New ringtone saved." });
        }
        setIsUpdating(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="flex flex-col items-center space-y-3 pb-4">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
            <User className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground font-mono text-sm">{user.phoneNumber}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Settings</h3>
          <Card className="border-none shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-all" onClick={handleRingtoneClick} disabled={isUpdating}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                  {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Custom Ringtone</p>
                  <p className="text-[10px] text-muted-foreground">Choose from device</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" />
          </Card>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 pt-2 flex items-center gap-2">
            <History className="h-3 w-3" /> Transaction Records
          </h3>
          
          <div className="space-y-3">
            {isTxLoading ? (
              <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : transactions && transactions.length > 0 ? (
              transactions.map(tx => (
                <Card key={tx.id} className="border-none shadow-sm overflow-hidden bg-white">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === "Success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {tx.status === "Success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-bold">₦{tx.amount?.toLocaleString()}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteTx(tx.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-none shadow-sm bg-slate-50 p-10 text-center">
                <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-muted-foreground">No transactions recorded yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
