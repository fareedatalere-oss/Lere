
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { buyAirtimeAction } from "@/lib/datahouse-actions";

export default function BuyAirtimePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [isLoading, setIsLoading] = useState(false);

  const val = parseFloat(amount || "0");
  const charge = val * 0.03; // 3% charge
  const total = val + charge;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (val <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }
    setStep("confirm");
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `Total: ₦${total.toLocaleString()}. Balance: ₦${user.balance.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
      const result = await buyAirtimeAction({
        mobile_number: phoneNumber,
        amount: val,
        network: network.toUpperCase()
      });

      if (result.Status?.toLowerCase() === "successful" || result.status?.toLowerCase() === "successful") {
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
        throw new Error(result.error || result.msg || result.message || "API Transaction Failed");
      }
    } catch (err: any) {
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Airtime Purchase",
        amount: val,
        status: "Failed",
        error: err.message,
        createdAt: serverTimestamp()
      });
      toast({ 
        variant: "destructive", 
        title: "Purchase Failed", 
        description: err.message || "Request could not be processed." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === "confirm" ? setStep("input") : router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Airtime</h1>
        </div>

        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardContent className="pt-6">
            {step === "input" ? (
              <form onSubmit={handleContinue} className="space-y-4">
                <div className="space-y-2">
                  <Label>Network Provider</Label>
                  <select 
                    className="w-full h-12 px-3 rounded-xl border bg-background" 
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    required
                  >
                    <option value="MTN">MTN</option>
                    <option value="AIRTEL">Airtel</option>
                    <option value="GLO">Glo</option>
                    <option value="9MOBILE">9mobile</option>
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
                <Button type="submit" className="w-full h-14 bg-primary text-white rounded-2xl shadow-lg font-bold">
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePurchase} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed text-sm space-y-3">
                  <div className="text-center pb-2 border-b">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Transaction Summary</p>
                    <p className="text-xl font-bold">{network} Airtime</p>
                  </div>
                  <div className="flex justify-between"><span>Recipient:</span><span className="font-bold">{phoneNumber}</span></div>
                  <div className="flex justify-between"><span>Amount:</span><span className="font-bold">₦{val.toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-500"><span>Service Fee (3%):</span><span className="font-bold">₦{charge.toFixed(2)}</span></div>
                  <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t"><span>Total Debit:</span><span>₦{total.toLocaleString()}</span></div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Enter Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-14 rounded-xl text-center text-2xl tracking-[1em]" />
                </div>

                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 mr-2" />}
                  Confirm & Pay
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
