"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BuyAirtimePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    const val = parseFloat(amount);
    const charge = val * 0.03;
    const total = val + charge;

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `Total: ₦${total.toLocaleString()}. Balance: ₦${user.balance.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
      // Datahouse API Integration
      const response = await fetch('https://datahouse.com.ng/api/buy_airtime', {
        method: 'POST',
        headers: { 
          'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          amount: val,
          network: "MTN" // Should be dynamic based on selection
        })
      });

      if (response.ok) {
        const userRef = doc(firestore, "users", user.id!);
        await updateDoc(userRef, { balance: increment(-total) });
        
        await addDoc(collection(firestore, "transactions"), {
          userId: user.id,
          type: "Airtime Purchase",
          amount: val,
          charge: charge,
          total: total,
          recipient: phoneNumber,
          status: "Success",
          createdAt: serverTimestamp()
        });

        toast({ title: "Purchase Successful", description: `₦${val} sent to ${phoneNumber}. Fee: ₦${charge.toFixed(2)}.` });
        router.push("/dashboard");
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Airtime Purchase",
        amount: val,
        status: "Failed",
        createdAt: serverTimestamp()
      });
      toast({ variant: "destructive", title: "Purchase Failed", description: "Request could not be processed at this time." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Airtime</h1>
        </div>

        <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label>Network Provider</Label>
                <select className="w-full h-12 px-3 rounded-xl border bg-background" required>
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                  <option value="glo">Glo</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="08012345678" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Transaction PIN</Label>
                <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-12 rounded-xl" />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                 <div className="flex justify-between"><span>Service Fee (3%):</span><span className="font-bold">₦{(parseFloat(amount || "0") * 0.03).toFixed(2)}</span></div>
                 <div className="flex justify-between text-primary font-bold"><span>Total Debit:</span><span>₦{(parseFloat(amount || "0") * 1.03).toFixed(2)}</span></div>
              </div>

              <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 mr-2" />}
                Top Up Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
