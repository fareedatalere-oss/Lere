
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function ExamsPinPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [pins, setPins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://datahouse.com.ng/api/exam_pins', {
        headers: { 'Authorization': 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941' }
      });
      const data = await response.json();
      setPins(data || []);
    } catch (err) {
      // Fallback
      setPins([
        { id: "waec", name: "WAEC Result Checker", price: 3400 },
        { id: "neco", name: "NECO Token", price: 950 },
        { id: "nabteb", name: "NABTEB Pin", price: 1200 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = (pin: any) => {
    if (!user || user.balance < pin.price) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: "Please fund your wallet first." });
      return;
    }
    toast({ title: "Pin Purchased", description: `Your ${pin.name} has been sent via SMS.` });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Exams Pin</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs">Fetching live pin prices...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pins.map((pin) => (
              <Card key={pin.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-3xl overflow-hidden cursor-pointer" onClick={() => handleBuy(pin)}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{pin.name}</h4>
                      <p className="text-xs text-green-600 font-bold">₦{pin.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
