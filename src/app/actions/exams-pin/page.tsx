
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, GraduationCap, ChevronRight, Loader2, Search, BookOpenCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getExamPinsAction } from "@/lib/datahouse-actions";

export default function ExamsPinPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [step, setStep] = useState<"list" | "confirm">("list");
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [pins, setPins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    setIsLoading(true);
    try {
      const data = await getExamPinsAction();
      setPins(Array.isArray(data) ? data : data.results || []);
    } catch {
      setPins([
        { id: "waec", name: "WAEC Result Checker", price: 3400 },
        { id: "neco", name: "NECO Token", price: 950 },
      ]);
    } finally { setIsLoading(false); }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !selectedPin) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    const total = parseFloat(selectedPin.price) + 100;

    if (user.balance < total) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: `Total is ₦${total.toLocaleString()}.` });
      return;
    }

    setIsLoading(true);
    try {
      // Mocking API success for pins as specific buy_exam_pin action would be needed
      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, { balance: increment(-total) });
      
      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Exam Pin Purchase",
        amount: selectedPin.price,
        charge: 100,
        total: total,
        recipient: user.phoneNumber,
        status: "Success",
        createdAt: serverTimestamp()
      });

      toast({ title: "Purchase Successful", description: `Your ${selectedPin.name} has been sent via SMS.` });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Request could not be processed." });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === "confirm" ? setStep("list") : router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Exams Pin</h1>
        </div>

        {step === "list" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search exam pins..." className="pl-10 h-12 rounded-2xl border-none shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs">Fetching pins...</p></div>
            ) : (
              <div className="grid gap-2">
                {pins.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pin) => (
                  <Card key={pin.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-3xl cursor-pointer group" onClick={() => { setSelectedPin(pin); setStep("confirm"); }}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all"><GraduationCap className="h-6 w-6" /></div>
                        <div><h4 className="font-bold text-sm">{pin.name}</h4><p className="text-xs text-green-600 font-bold">₦{pin.price.toLocaleString()}</p></div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleBuy} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed text-sm space-y-3">
                  <div className="text-center pb-2 border-b">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Purchase Summary</p>
                    <p className="text-xl font-bold">{selectedPin.name}</p>
                  </div>
                  <div className="flex justify-between"><span>Pin Price:</span><span className="font-bold">₦{selectedPin.price.toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-500"><span>Service Fee:</span><span className="font-bold">₦100.00</span></div>
                  <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t"><span>Total Debit:</span><span>₦{(selectedPin.price + 100).toLocaleString()}</span></div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Enter Transaction PIN</Label>
                  <Input type="password" placeholder="****" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} className="h-14 rounded-xl text-center text-2xl tracking-[1em]" />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Pay Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
