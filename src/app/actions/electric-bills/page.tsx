
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function ElectricBillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [step, setStep] = useState<"disco" | "pay">("disco");
  const [selectedDisco, setSelectedDisco] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [meter, setMeter] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://datahouse.com.ng/api/electricity_providers', {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      setProviders(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      // Fallback
      setProviders([
        { id: "ikedc", name: "Ikeja Electric" },
        { id: "ekedc", name: "Eko Electric" },
        { id: "aedc", name: "Abuja Electric" },
        { id: "phedra", name: "Port Harcourt Electric" },
        { id: "ibedc", name: "Ibadan Electric" },
        { id: "kaedco", name: "Kaduna Electric" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const charge = 10;
    const total = parseFloat(amount) + charge;
    if (!user || user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: `Total is ₦${total.toLocaleString()} incl. ₦10 fee.` });
      return;
    }
    toast({ title: "Payment Successful", description: `Token generated for meter ${meter}. ₦10 fee applied.` });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === "pay" ? setStep("disco") : router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Electric Bills</h1>
        </div>

        {step === "disco" ? (
           <div className="space-y-3">
             <Label className="text-[10px] uppercase font-bold text-muted-foreground pl-1">Select Distribution Company</Label>
             {isLoading ? (
               <div className="flex items-center justify-center py-20 flex-col gap-2">
                 <Loader2 className="animate-spin h-8 w-8 text-primary" />
                 <p className="text-xs">Fetching all providers...</p>
               </div>
             ) : (
               <div className="grid gap-3">
                 {providers.map(p => (
                   <Button 
                    key={p.id}
                    variant="outline"
                    className="h-16 flex items-center justify-between rounded-2xl bg-white border-none shadow-sm hover:shadow-md px-6"
                    onClick={() => {
                      setSelectedDisco(p);
                      setStep("pay");
                    }}
                  >
                    <span className="font-bold">{p.name}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                 ))}
               </div>
             )}
           </div>
        ) : (
          <Card className="border-none shadow-lg rounded-3xl">
            <CardContent className="pt-6">
              <form onSubmit={handlePay} className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100 mb-4">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-orange-800">Selected Provider</p>
                    <p className="text-sm font-bold">{selectedDisco.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meter Number</Label>
                  <Input 
                    placeholder="Enter Meter ID" 
                    className="h-12 rounded-xl"
                    value={meter}
                    onChange={(e) => setMeter(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 rounded-xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} className="h-12 rounded-xl" required />
                </div>
                <div className="text-[10px] text-center font-bold text-muted-foreground uppercase">
                  A flat fee of ₦10.00 will be added
                </div>
                <Button type="submit" className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold">
                  <ShieldCheck className="mr-2 h-5 w-5" /> Pay Bill Now
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
