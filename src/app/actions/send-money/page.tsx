
"use client";

import { UserProvider } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function SendMoneyContent() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Transaction Successful",
      description: "Funds have been sent successfully.",
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
          <h1 className="text-2xl font-bold">Send Money</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Recipient Credit Input</Label>
                <Input id="account" placeholder="Enter recipient number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Destination</Label>
                <Input id="bank" placeholder="Lere Connect Wallet" value="Lere Connect Wallet" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input id="amount" type="number" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <Input id="pin" type="password" placeholder="****" required />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                <Send className="h-4 w-4 mr-2" /> Transfer Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SendMoneyPage() {
  return (
    <UserProvider>
      <SendMoneyContent />
    </UserProvider>
  );
}
