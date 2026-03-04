
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tv, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function TVSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [smartCard, setSmartCard] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://datahouse.com.ng/api/tv_plans', {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      setPlans(data || []);
    } catch (err) {
      // Fallback
      setPlans([
        { id: 1, name: "DSTV Compact", price: 12500 },
        { id: 2, name: "GOTV Jolli", price: 4850 },
        { id: 3, name: "Startimes Nova", price: 1500 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Subscription Active", description: "Your TV plan has been renewed successfully." });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">TV Subscription</h1>
        </div>

        <Card className="border-none shadow-lg rounded-3xl">
          <CardContent className="pt-6">
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-2">
                <Label>Service Provider</Label>
                <select className="w-full h-12 px-3 rounded-xl border border-input bg-background" required>
                  <option value="dstv">DSTV</option>
                  <option value="gotv">GOTV</option>
                  <option value="startimes">Startimes</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>SmartCard / IUC Number</Label>
                <Input 
                  placeholder="Enter Number" 
                  className="h-12 rounded-xl"
                  value={smartCard}
                  onChange={(e) => setSmartCard(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Select Plan</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-xs py-2"><Loader2 className="animate-spin h-3 w-3" /> Fetching plans...</div>
                ) : (
                  <select className="w-full h-12 px-3 rounded-xl border border-input bg-background" required>
                    <option value="">Select Package</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} (₦{p.price.toLocaleString()})</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Transaction PIN</Label>
                <Input type="password" placeholder="****" maxLength={4} className="h-12 rounded-xl" required />
              </div>
              <Button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold">
                <ShieldCheck className="mr-2 h-5 w-5" /> Renew Subscription
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
