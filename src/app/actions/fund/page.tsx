
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  PlusCircle, 
  Loader2, 
  Lock,
  CheckCircle2,
  Copy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

declare const FlutterwaveCheckout: any;

export default function FundWalletPage() {
  const router = useRouter();
  const { user, addReward } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<"card" | "bank" | null>(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidatedCard, setHasValidatedCard] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleValidation = () => {
    setIsLoading(true);
    const config = {
      public_key: 'FLWPUBK-b5cf7b9719da42916014631461d5910f-X',
      tx_ref: Date.now().toString(),
      amount: 100,
      currency: 'NGN',
      payment_options: 'card',
      customer: {
        email: `${user?.phoneNumber}@lereconnect.com`,
        phone_number: user?.phoneNumber,
        name: user?.username,
      },
      callback: async (response: any) => {
        if (response.status === "successful") {
          toast({ title: "Card Validated", description: "₦100 charged. Your card is now saved." });
          setHasValidatedCard(true);
          // Update user balance minus 10 fee
          if (user?.id && firestore) {
            const userRef = doc(firestore, "users", user.id);
            await updateDoc(userRef, { balance: increment(90) });
          }
        }
        setIsLoading(false);
      },
      onclose: () => setIsLoading(false),
    };
    FlutterwaveCheckout(config);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== user?.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "The transaction PIN entered is incorrect." });
      return;
    }

    setIsLoading(true);
    const fundAmount = parseFloat(amount);
    const charge = 10;
    const finalCredit = fundAmount - charge;

    const config = {
      public_key: 'FLWPUBK-b5cf7b9719da42916014631461d5910f-X',
      tx_ref: Date.now().toString(),
      amount: fundAmount,
      currency: 'NGN',
      payment_options: 'card',
      customer: {
        email: `${user?.phoneNumber}@lereconnect.com`,
        phone_number: user?.phoneNumber,
        name: user?.username,
      },
      callback: async (response: any) => {
        if (response.status === "successful") {
          if (user?.id && firestore) {
            const userRef = doc(firestore, "users", user.id);
            await updateDoc(userRef, { balance: increment(finalCredit) });
            toast({ title: "Funded Successfully", description: `₦${finalCredit.toLocaleString()} added to your wallet.` });
            router.push("/dashboard");
          }
        }
        setIsLoading(false);
      },
      onclose: () => setIsLoading(false),
    };
    FlutterwaveCheckout(config);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Account number copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Fund Wallet</h1>
        </div>

        {!method ? (
          <div className="grid gap-4">
            <Card className="border-none shadow-sm hover:shadow-md cursor-pointer transition-all" onClick={() => setMethod("card")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Use Card</h3>
                  <p className="text-xs text-muted-foreground">Fund instantly with your credit/debit card</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md cursor-pointer transition-all" onClick={() => setMethod("bank")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Use Account Number</h3>
                  <p className="text-xs text-muted-foreground">Transfer to a dedicated virtual account</p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Transaction Charges</p>
              <p className="text-sm font-bold text-primary">₦10.00 flat fee applies to all funding</p>
            </div>
          </div>
        ) : method === "card" ? (
          <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
            <div className="bg-primary p-6 text-white text-center">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold">Secure Card Funding</h2>
            </div>
            <CardContent className="p-6 space-y-6">
              {!hasValidatedCard ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs font-medium">
                    First-time users must validate their card with a ₦100 charge (Refunded to wallet minus ₦10 fee).
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold" onClick={handleValidation} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                    Validate Card Now
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFund} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Funding Amount (₦)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      className="h-12 rounded-xl"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>App Transaction PIN</Label>
                    <Input 
                      type="password" 
                      placeholder="****" 
                      maxLength={4}
                      className="h-12 rounded-xl"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Funding"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
               <div className="bg-green-600 p-6 text-white text-center">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-80" />
                <h2 className="text-xl font-bold">Virtual Account</h2>
                <p className="text-xs opacity-70">Expires in 30 minutes</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="p-6 bg-accent/20 rounded-2xl border-2 border-dashed border-accent flex flex-col items-center gap-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Lere Connect Temporary Bank</p>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-mono font-bold text-primary">0039228312</h1>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("0039228312")}>
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm font-bold">Wema Bank / Lere Connect</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Transfer any amount to this account. Your wallet will be credited automatically.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">A ₦10.00 network charge will be deducted from your deposit.</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold" onClick={() => router.push("/dashboard")}>
                  I have sent the money
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
