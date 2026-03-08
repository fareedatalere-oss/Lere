"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Loader2, 
  Zap,
  Building2,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

declare const FlutterwaveCheckout: any;

export default function FundWalletPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const val = parseFloat(amount || "0");
  const fee = val > 0 && val <= 1000 ? 30 : val > 1000 ? 50 : 0;
  const finalCredit = val - fee;

  const handleFlutterwavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !firestore) return;
    if (val < 100) {
      toast({ variant: "destructive", title: "Minimum Amount", description: "You must deposit at least ₦100." });
      return;
    }
    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "The transaction PIN entered is incorrect." });
      return;
    }

    if (!process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Public key missing in environment variables." });
      return;
    }

    setIsLoading(true);

    const config = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: "LERE_" + Date.now().toString(),
      amount: val,
      currency: 'NGN',
      payment_options: 'card,ussd,account,banktransfer,qr',
      customer: {
        email: `${user.phoneNumber}@lereconnect.com`,
        phone_number: user.phoneNumber,
        name: user.username,
      },
      customizations: {
        title: "Lere Tele App",
        description: `Wallet Funding for ${user.username}`,
        logo: "https://picsum.photos/seed/lere/200/200",
      },
      callback: async (response: any) => {
        if (response.status === "successful") {
          const userRef = doc(firestore, "users", user.id!);
          await updateDoc(userRef, { balance: increment(finalCredit) });
          
          await addDoc(collection(firestore, "transactions"), {
            userId: user.id,
            type: "Wallet Funding",
            amount: val,
            fee: fee,
            total: finalCredit,
            status: "Success",
            method: response.payment_type || "Transfer",
            createdAt: serverTimestamp()
          });

          toast({ title: "Funding Successful", description: `₦${finalCredit.toLocaleString()} added to your balance.` });
          router.push("/dashboard");
        } else {
          toast({ variant: "destructive", title: "Payment Failed", description: "Could not complete transaction." });
        }
        setIsLoading(false);
      },
      onclose: () => setIsLoading(false),
    };

    FlutterwaveCheckout(config);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Deposit Funds</h1>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="bg-primary p-10 text-white text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold">Secure Checkout</h2>
            <p className="text-white/60 text-xs">Supports USSD, Card, and Bank Transfer</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleFlutterwavePayment} className="space-y-6">
              <div className="space-y-2">
                <Label>Amount to Deposit (₦)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  className="h-14 rounded-2xl text-lg font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {val >= 100 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Deposit:</span>
                    <span>₦{val.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-red-500 uppercase">
                    <span>Lere Fee:</span>
                    <span>-₦{fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary border-t pt-2">
                    <span>Credit:</span>
                    <span>₦{finalCredit.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Confirm PIN</Label>
                <Input 
                  type="password" 
                  placeholder="****" 
                  maxLength={4}
                  className="h-14 rounded-2xl text-center text-3xl tracking-[1em]"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-16 rounded-3xl bg-primary text-white font-bold text-lg shadow-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 mr-2" />}
                Pay with Flutterwave
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <span className="text-[10px] font-bold text-center">BANK TRANSFER SUPPORTED</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-[10px] font-bold text-center">USSD & CARD SECURED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
