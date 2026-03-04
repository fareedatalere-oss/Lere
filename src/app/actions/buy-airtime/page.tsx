
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function BuyAirtimePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.balance < parseFloat(amount)) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please fund your wallet to complete this purchase.",
      });
      return;
    }
    toast({
      title: "Purchase Successful",
      description: `₦${amount} airtime sent to ${phoneNumber}.`,
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
          <h1 className="text-2xl font-bold">Buy Airtime</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network Provider</Label>
                <select 
                  id="network" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select Network</option>
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                  <option value="glo">Glo</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="08012345678" 
                  required 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Your Wallet Balance</p>
                <p className="text-lg font-bold">₦{user?.balance.toLocaleString()}</p>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl shadow-lg">
                <Zap className="h-4 w-4 mr-2" /> Top Up Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
