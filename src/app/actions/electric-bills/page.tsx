
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function ElectricBillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [meter, setMeter] = useState("");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.balance < parseFloat(amount)) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: "Please fund your wallet." });
      return;
    }
    toast({ title: "Payment Successful", description: `Token generated for meter ${meter}.` });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Electric Bills</h1>
        </div>

        <Card className="border-none shadow-lg rounded-3xl">
          <CardContent className="pt-6">
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-2">
                <Label>Distribution Company (Disco)</Label>
                <select className="w-full h-12 px-3 rounded-xl border border-input bg-background">
                  <option>IKEDC (Ikeja Electric)</option>
                  <option>EKEDC (Eko Electric)</option>
                  <option>AEDC (Abuja Electric)</option>
                  <option>PHED (Port Harcourt Electric)</option>
                </select>
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
              <Button type="submit" className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold">
                <ShieldCheck className="mr-2 h-5 w-5" /> Pay Bill Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
