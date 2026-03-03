
"use client";

import { UserProvider } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function BuyDataContent() {
  const router = useRouter();
  const { toast } = useToast();

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Purchase Successful",
      description: "Data plan activated successfully.",
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
          <CardContent className="pt-6">
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network Provider</Label>
                <Input id="network" placeholder="MTN, Airtel, Glo, 9mobile" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="08012345678" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Select Data Plan</Label>
                <Input id="plan" placeholder="1GB - ₦500" required />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                <Wifi className="h-4 w-4 mr-2" /> Purchase Data
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BuyDataPage() {
  return (
    <UserProvider>
      <BuyDataContent />
    </UserProvider>
  );
}
