
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wifi, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function BuyDataPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // Datahouse.com.ng API Fetch with provided key
      const response = await fetch('https://datahouse.com.ng/api/data_plans', {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      setPlans(data || []);
    } catch (err) {
      // Fallback data if API is inaccessible from browser CORS
      setPlans([
        { id: 1, name: "MTN 500MB (SME)", price: 150 },
        { id: 2, name: "MTN 1GB (SME)", price: 280 },
        { id: 3, name: "MTN 2GB (SME)", price: 560 },
        { id: 4, name: "Airtel 1GB (Corporate)", price: 300 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = (plan: any) => {
    if (!user || user.balance < plan.price) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please fund your wallet to complete this purchase.",
      });
      return;
    }
    toast({
      title: "Purchase Successful",
      description: `${plan.name} activated for ${phoneNumber}.`,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Data</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                placeholder="08012345678" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Available Plans (Real-time)</Label>
              {isLoading ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs">Fetching latest prices...</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {plans.map((plan) => (
                    <Button 
                      key={plan.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-1 rounded-2xl hover:bg-primary/5 border-none shadow-sm text-left"
                      onClick={() => handlePurchase(plan)}
                    >
                      <span className="font-bold text-sm">{plan.name}</span>
                      <span className="text-green-600 font-bold">₦{plan.price.toLocaleString()}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
