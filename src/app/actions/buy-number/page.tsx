"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Smartphone, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function BuyNumberPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleBuy = (num: string) => {
    toast({
      title: "Processing",
      description: `Initiating request for ${num}.`,
    });
  };

  const numbers = ["+234 810 223 4455", "+234 901 334 5566", "+234 703 112 3344"];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Number</h1>
        </div>

        <div className="space-y-3">
          {numbers.map((num) => (
            <Card key={num} className="border-none shadow-sm hover:bg-accent/50 cursor-pointer" onClick={() => handleBuy(num)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span className="font-mono font-bold">{num}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">₦2,500</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
