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

export default function TVSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [step, setStep] = useState<"provider" | "plans">("provider");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [smartCard, setSmartCard] = useState("");
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
      const response = await fetch(`https://datahouse.com.ng/api/tv_plans?provider=${providerId}`, {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      const planList = Array.isArray(data) ? data : data.results || [];
      setPlans(planList);
    } catch (err) {
      console.error("API error", err);
      const fallbacks: Record<string, any[]> = {
        dstv: [
          { id: 1, name: "DSTV Compact", price: 12500 },
          { id: 4, name: "DSTV Premium", price: 29500 },
          { id: 5, name: "DSTV Confam", price: 7400 },
          { id: 10, name: "DSTV Padi", price: 2950 },
          { id: 11, name: "DSTV Compact Plus", price: 19800 },
        ],
        gotv: [
          { id: 2, name: "GOTV Jolli", price: 4850 },
          { id: 6, name: "GOTV Max", price: 7200 },
          { id: 7, name: "GOTV Jinja", price: 3300 },
          { id: 12, name: "GOTV Supa", price: 9600 },
          { id: 13, name: "GOTV Lite", price: 1575 },
        ],
        startimes: [
          { id: 3, name: "Startimes Nova", price: 1500 },
          { id: 8, name: "Startimes Basic", price: 3300 },
          { id: 9, name: "Startimes Smart", price: 4700 },
          { id: 14, name: "Startimes Super", price: 8200 },
        ],
      };
      setPlans(fallbacks[providerId] || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (id: string) => {
    setSelectedProvider(id);
    setStep("plans");
    fetchPlans(id);
  };

  const handlePay = (plan: any) => {
    if (!smartCard) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your SmartCard/IUC number." });
      return;
    }
    const charge = 10;
    const total = plan.price + charge;
    if (!user || user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: `Total is ₦${total.toLocaleString()}. Fund wallet.` });
      return;
    }
    toast({ title: "Subscription Active", description: `${plan.name} renewed. ₦10 fee applied.` });
    router.push("/dashboard");
  };

  const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === "plans" ? setStep("provider") : router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{step === "provider" ? "TV Provider" : "Select Package"}</h1>
        </div>

        {step === "provider" ? (
          <div className="grid gap-3">
            {providers.map(p => (
              <Button 
                key={p.id}
                variant="outline"
                className="h-20 flex items-center justify-between rounded-3xl bg-white border-none shadow-sm hover:shadow-md px-6 group"
                onClick={() => handleProviderSelect(p.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    {p.icon}
                  </div>
                  <span className="font-bold">{p.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>SmartCard / IUC Number</Label>
                <Input 
                  placeholder="Enter IUC Number" 
                  className="h-12 rounded-xl"
                  value={smartCard}
                  onChange={(e) => setSmartCard(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Available {selectedProvider.toUpperCase()} Packages</Label>
                    <span className="bg-primary/10 text-primary text-[8px] font-bold px-1.5 rounded">{plans.length} Packages</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600">₦10 Fee</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search packages..." 
                    className="pl-9 h-10 text-xs rounded-xl border-none bg-accent/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center gap-2 text-xs py-10 justify-center flex-col">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <p>Fetching all available plans...</p>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide pb-4">
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map(p => (
                        <Button 
                          key={p.id}
                          variant="outline"
                          className="h-auto p-4 flex items-center justify-between rounded-2xl hover:bg-primary/5 border-none shadow-sm text-left group bg-slate-50/50"
                          onClick={() => handlePay(p)}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{p.name}</span>
                            <span className="text-red-600 font-bold text-xs">₦{p.price.toLocaleString()}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      ))
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <LayoutList className="h-8 w-8 mx-auto text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No packages found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
