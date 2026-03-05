"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Loader2, Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BuyDataPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [step, setStep] = useState<"network" | "plans" | "confirm">("network");
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
    try {
      const response = await fetch(`https://datahouse.com.ng/api/data_plans?network=${net}`, {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      setPlans(Array.isArray(data) ? data : data.results || []);
    } catch {
      setPlans([
        { id: 1, name: "500MB SME", price: 150 },
        { id: 2, name: "1GB SME", price: 280 },
        { id: 3, name: "2GB SME", price: 560 },
        { id: 5, name: "5GB SME", price: 1400 },
      ]);
    } finally { setIsLoading(false); }
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

    const total = selectedPlan.price + 50;

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `Total is ₦${total.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
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
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Could not process transaction." });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === "network" ? router.back() : setStep(step === "confirm" ? "plans" : "network")} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Data</h1>
        </div>

        {step === "network" && (
          <div className="grid grid-cols-2 gap-4">
            {networks.map(n => (
              <Button key={n.id} variant="outline" className="h-32 flex flex-col gap-2 rounded-3xl bg-white border-none shadow-sm" onClick={() => handleNetworkSelect(n.id)}>
                <div className={`w-12 h-12 ${n.color} rounded-full flex items-center justify-center font-bold`}>{n.icon}</div>
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
            <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <Card key={p.id} className="border-none shadow-sm cursor-pointer hover:bg-primary/5" onClick={() => { setSelectedPlan(p); setStep("confirm"); }}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-xs text-green-600 font-bold">₦{p.price.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "confirm" && (
          <Card className="border-none shadow-xl rounded-3xl">
            <CardContent className="pt-6">
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Confirm Plan</p>
                  <p className="text-xl font-bold">{selectedPlan.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="080..." required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                  <div className="flex justify-between"><span>Plan Price:</span><span className="font-bold">₦{selectedPlan.price.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Service Fee:</span><span className="font-bold">₦50.00</span></div>
                  <div className="flex justify-between text-primary font-bold"><span>Total Debit:</span><span>₦{(selectedPlan.price + 50).toLocaleString()}</span></div>
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Purchase Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
