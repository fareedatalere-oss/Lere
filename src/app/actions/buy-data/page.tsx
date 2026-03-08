
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Loader2, Search, ChevronRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDataPlansAction, buyDataAction } from "@/lib/datahouse-actions";

export default function BuyDataPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [step, setStep] = useState<"network" | "plans" | "details" | "confirm">("network");
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const networks = [
    { id: "mtn", name: "MTN", icon: "M", color: "bg-yellow-400" },
    { id: "airtel", name: "Airtel", icon: "A", color: "bg-red-600 text-white" },
    { id: "glo", name: "Glo", icon: "G", color: "bg-green-600 text-white" },
    { id: "9mobile", name: "9mobile", icon: "9", color: "bg-green-900 text-white" },
  ];

  const fetchPlans = async (net: string) => {
    setIsLoading(true);
    setPlans([]);
    try {
      const data = await getDataPlansAction(net);
      if (data.error) {
        throw new Error(data.message || "Failed to fetch plans");
      }
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Plan Error", description: err.message });
      setStep("network");
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleNetworkSelect = (id: string) => {
    setSelectedNetwork(id);
    setStep("plans");
    fetchPlans(id);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !selectedPlan) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    const total = parseFloat(selectedPlan.price) + 50;

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `Total: ₦${total.toLocaleString()}. Balance: ₦${user.balance.toLocaleString()}` });
      return;
    }

    setIsLoading(true);
    try {
      const result = await buyDataAction({
        mobile_number: phoneNumber,
        plan: selectedPlan.id,
        network: selectedNetwork!.toUpperCase()
      });

      if (result.Status?.toLowerCase() === "successful" || result.status?.toLowerCase() === "successful") {
        const userRef = doc(firestore, "users", user.id!);
        await updateDoc(userRef, { balance: increment(-total) });
        
        await addDoc(collection(firestore, "transactions"), {
          userId: user.id,
          type: "Data Purchase",
          amount: selectedPlan.price,
          charge: 50,
          total: total,
          recipient: phoneNumber,
          status: "Success",
          createdAt: serverTimestamp()
        });

        toast({ title: "Purchase Successful", description: `${selectedPlan.name} active on ${phoneNumber}.` });
        router.push("/dashboard");
      } else {
        throw new Error(result.message || result.error || result.msg || "Transaction Failed");
      }
    } catch (err: any) {
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Data Purchase",
        amount: selectedPlan.price,
        status: "Failed",
        error: err.message,
        createdAt: serverTimestamp()
      });
      toast({ variant: "destructive", title: "Transaction Failed", description: err.message });
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === "plans") setStep("network");
            else if (step === "details") setStep("plans");
            else if (step === "confirm") setStep("details");
            else router.back();
          }} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Data</h1>
        </div>

        {step === "network" && (
          <div className="grid grid-cols-2 gap-4">
            {networks.map(n => (
              <Button key={n.id} variant="outline" className="h-32 flex flex-col gap-2 rounded-3xl bg-white border-none shadow-sm" onClick={() => handleNetworkSelect(n.id)}>
                <div className={`w-12 h-12 ${n.color} rounded-full flex items-center justify-center font-bold text-xl`}>{n.icon}</div>
                <span className="font-bold">{n.name}</span>
              </Button>
            ))}
          </div>
        )}

        {step === "plans" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search plans..." className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs font-bold">Fetching Live Plans...</p></div>
            ) : (
              <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {plans.length === 0 && <p className="text-center text-xs text-muted-foreground py-10 italic">No plans available or API balance low.</p>}
                {plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <Card key={p.id} className="border-none shadow-sm cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => { setSelectedPlan(p); setStep("details"); }}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-xs text-green-600 font-bold">₦{parseFloat(p.price).toLocaleString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "details" && (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }} className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-2xl text-center border-2 border-dashed border-primary/20">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Selected Data Plan</p>
                  <p className="text-xl font-bold">{selectedPlan.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Recipient Phone Number</Label>
                  <Input placeholder="080..." required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-14 rounded-2xl text-lg font-bold" />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg">
                  Continue to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "confirm" && (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handlePurchase} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed text-sm space-y-3">
                  <div className="text-center pb-2 border-b">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Transaction Summary</p>
                    <p className="text-xl font-bold">{selectedPlan.name}</p>
                  </div>
                  <div className="flex justify-between"><span>Phone:</span><span className="font-bold">{phoneNumber}</span></div>
                  <div className="flex justify-between"><span>Plan Price:</span><span className="font-bold">₦{parseFloat(selectedPlan.price).toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-500"><span>Service Fee:</span><span className="font-bold">₦50.00</span></div>
                  <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t"><span>Total Debit:</span><span>₦{(parseFloat(selectedPlan.price) + 50).toLocaleString()}</span></div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-primary" /> Enter Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-16 rounded-2xl text-center text-3xl tracking-[1em]" />
                </div>

                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Buy Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
