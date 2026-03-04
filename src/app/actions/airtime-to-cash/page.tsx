
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Repeat, Wallet, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function AirtimeToCashPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid airtime amount." });
      return;
    }
    toast({
      title: "Request Submitted",
      description: "Our agents will verify your airtime transfer shortly.",
    });
    router.push("/dashboard");
  };

  const receiveAmount = amount ? (parseFloat(amount) * 0.85).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Airtime to Cash</h1>
        </div>

        <Card className="border-none shadow-lg bg-white overflow-hidden">
          <div className="bg-primary p-6 text-white text-center">
            <Repeat className="h-12 w-12 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium opacity-90">Convert your airtime to wallet balance</p>
            <p className="text-xs mt-1 text-white/60">Current rate: 85% payout</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network Provider</Label>
                <select 
                  id="network" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  <option value="">Select Network</option>
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                  <option value="glo">Glo</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Sender Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="08012345678" 
                  required 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Airtime Amount (₦)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Minimum ₦500" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-dashed border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You send:</span>
                  <span className="font-bold">₦{amount || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You receive:</span>
                  <span className="font-bold text-green-600">₦{receiveAmount}</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Convert Now
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> Wallet Destination
          </h4>
          <p className="text-xs text-muted-foreground">
            Funds will be deposited into your **Credit Input**: {user?.accountNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
