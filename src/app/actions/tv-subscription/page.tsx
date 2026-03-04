
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tv, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function TVSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [smartCard, setSmartCard] = useState("");

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
                <select className="w-full h-12 px-3 rounded-xl border border-input bg-background">
                  <option>DSTV</option>
                  <option>GOTV</option>
                  <option>Startimes</option>
                  <option>Showmax</option>
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
                <Label>Plan</Label>
                <select className="w-full h-12 px-3 rounded-xl border border-input bg-background">
                  <option>Compact (₦12,500)</option>
                  <option>Padi (₦2,500)</option>
                  <option>Jolli (₦4,850)</option>
                </select>
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
