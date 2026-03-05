"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tv, ShieldCheck, Loader2, ChevronRight, Search, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getTvPlansAction } from "@/lib/datahouse-actions";

export default function TVSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [step, setStep] = useState<"provider" | "plans" | "details" | "confirm">("provider");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [smartCard, setSmartCard] = useState("");
  const [pin, setPin] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const providers = [
    { id: "dstv", name: "DSTV", icon: "D" },
    { id: "gotv", name: "GOTV", icon: "G" },
    { id: "startimes", name: "Startimes", icon: "S" },
    { id: "showmax", name: "Showmax", icon: "X" },
  ];

  const fetchPlans = async (providerId: string) => {
    setIsLoading(true);
    try {
      const data = await getTvPlansAction(providerId);
      setPlans(Array.isArray(data) ? data : data.results || []);
    } catch {
      setPlans([{ id: 1, name: "DSTV Compact", price: 12500 }]);
    } finally { setIsLoading(false); }
  };

  const handleProviderSelect = (id: string) => {
    setSelectedProvider(id);
    setStep("plans");
    fetchPlans(id);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !selectedPlan) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    const total = parseFloat(selectedPlan.price) + 100;

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: `Total: ₦${total.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, { balance: increment(-total) });
      
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "TV Subscription",
        amount: selectedPlan.price,
        charge: 100,
        total: total,
        recipient: smartCard,
        status: "Success",
        createdAt: serverTimestamp()
      });

      toast({ title: "Subscription Active", description: `${selectedPlan.name} renewed for ${smartCard}.` });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Request failed." });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === "confirm") setStep("details");
            else if (step === "details") setStep("plans");
            else if (step === "plans") setStep("provider");
            else router.back();
          }} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">TV Subscription</h1>
        </div>

        {step === "provider" ? (
          <div className="grid gap-3">
            {providers.map(p => (
              <Button key={p.id} variant="outline" className="h-20 justify-between rounded-3xl bg-white border-none shadow-sm px-6" onClick={() => handleProviderSelect(p.id)}>
                <span className="font-bold">{p.name}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            ))}
          </div>
        ) : step === "plans" ? (
          <div className="space-y-4">
             <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search packages..." className="pl-10 h-12 rounded-xl bg-white border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {isLoading ? (
               <div className="flex flex-col items-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs">Loading plans...</p></div>
            ) : (
              <div className="grid gap-2 max-h-[70vh] overflow-y-auto">
                {plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <Card key={p.id} className="border-none shadow-sm cursor-pointer hover:bg-primary/5" onClick={() => { setSelectedPlan(p); setStep("details"); }}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-red-600 font-bold">₦{parseFloat(p.price).toLocaleString()}</p></div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : step === "details" ? (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }} className="space-y-4">
                 <div className="p-4 bg-primary/5 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{selectedProvider.toUpperCase()}</p>
                  <p className="text-xl font-bold">{selectedPlan.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>SmartCard / IUC Number</Label>
                  <Input placeholder="Enter IUC Number" required value={smartCard} onChange={(e) => setSmartCard(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg">
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
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Renewal Summary</p>
                    <p className="text-xl font-bold">{selectedPlan.name}</p>
                  </div>
                  <div className="flex justify-between"><span>IUC/SmartCard:</span><span className="font-bold">{smartCard}</span></div>
                  <div className="flex justify-between"><span>Plan Price:</span><span className="font-bold">₦{parseFloat(selectedPlan.price).toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-500"><span>Service Fee:</span><span className="font-bold">₦100.00</span></div>
                  <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t"><span>Total Debit:</span><span>₦{(parseFloat(selectedPlan.price) + 100).toLocaleString()}</span></div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Enter Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-14 rounded-xl text-center text-2xl tracking-[1em]" />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg" disabled={isLoading}>
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
