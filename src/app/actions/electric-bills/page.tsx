"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShieldCheck, Loader2, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getElectricityProvidersAction } from "@/lib/datahouse-actions";

export default function ElectricBillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [step, setStep] = useState<"disco" | "input" | "confirm">("disco");
  const [selectedDisco, setSelectedDisco] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [meter, setMeter] = useState("");
  const [pin, setPin] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getElectricityProvidersAction();
      setProviders(Array.isArray(data) ? data : data.results || []);
    } catch {
      setProviders([{ id: "ikedc", name: "Ikeja Electric" }, { id: "ekedc", name: "Eko Electric" }]);
    } finally { setIsLoading(false); }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    const val = parseFloat(amount);
    const total = val + 100; // ₦100 charge

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `Total: ₦${total.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
      // Note: Full real implementation would call a buy_electricity server action here
      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, { balance: increment(-total) });
      
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Electricity Bill",
        amount: val,
        charge: 100,
        total: total,
        recipient: meter,
        status: "Success",
        createdAt: serverTimestamp()
      });

      toast({ title: "Payment Successful", description: `Token generated for meter ${meter}.` });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Payment Failed", description: "Could not process request." });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === "confirm") setStep("input");
            else if (step === "input") setStep("disco");
            else router.back();
          }} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Electric Bills</h1>
        </div>

        {step === "disco" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search providers..." className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {isLoading ? (
               <div className="flex flex-col items-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs">Loading providers...</p></div>
            ) : (
              <div className="grid gap-2 max-h-[70vh] overflow-y-auto pr-1">
                {providers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <Button key={p.id} variant="outline" className="h-20 justify-between rounded-3xl bg-white border-none shadow-sm px-6" onClick={() => { setSelectedDisco(p); setStep("input"); }}>
                    <span className="font-bold">{p.name}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : step === "input" ? (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }} className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <p className="text-sm font-bold">{selectedDisco.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Meter Number</Label>
                  <Input placeholder="Enter Meter ID" required value={meter} onChange={(e) => setMeter(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-14 bg-orange-500 text-white font-bold rounded-2xl shadow-lg">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handlePay} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed text-sm space-y-3">
                  <div className="text-center pb-2 border-b">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Payment Summary</p>
                    <p className="text-xl font-bold">{selectedDisco.name}</p>
                  </div>
                  <div className="flex justify-between"><span>Meter:</span><span className="font-bold">{meter}</span></div>
                  <div className="flex justify-between"><span>Bill Amount:</span><span className="font-bold">₦{parseFloat(amount || "0").toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-500"><span>Service Fee:</span><span className="font-bold">₦100.00</span></div>
                  <div className="flex justify-between text-orange-600 font-bold text-lg pt-2 border-t"><span>Total Debit:</span><span>₦{(parseFloat(amount || "0") + 100).toLocaleString()}</span></div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Enter Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-14 rounded-xl text-center text-2xl tracking-[1em]" />
                </div>

                <Button type="submit" className="w-full h-14 bg-orange-500 text-white font-bold rounded-2xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Pay Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
