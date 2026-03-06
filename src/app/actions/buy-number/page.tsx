
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Smartphone, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Tag,
  CheckCircle2,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

export default function BuyNumberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [view, setView] = useState<"menu" | "buy_rules" | "buy_list" | "sell_rules" | "sell_form" | "validation">("menu");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sell Form States
  const [sellForm, setSellForm] = useState({
    nin: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    middleName: "",
  });

  // Real-time listener for available numbers (no mock data)
  const availableNumbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "number_listings"), where("type", "==", "purchase"), where("status", "==", "available"));
  }, [firestore]);

  const { data: availableNumbers, isLoading: loadingAvailable } = useCollection(availableNumbersQuery);

  const handleBuyNumber = async (num: any) => {
    if (!user || !firestore) return;
    if (user.balance < num.price) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: "Please fund your wallet to get a new number." });
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, { balance: increment(-num.price) });
      
      await updateDoc(doc(firestore, "number_listings", num.id), {
        status: "sold",
        buyerId: user.id,
        soldAt: serverTimestamp()
      });

      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Number Purchase",
        amount: num.price,
        recipient: num.number,
        status: "Success",
        createdAt: serverTimestamp()
      });

      toast({ title: "Purchase Successful", description: `${num.number} is now registered to your account.` });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Transaction failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSellPrice = (num: string) => {
    const start = num.slice(0, 3);
    if (["081", "091", "070"].includes(start)) return 2500;
    return 2000;
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    if (sellForm.nin.length !== 11) {
      toast({ variant: "destructive", title: "Invalid NIN", description: "NIN must be 11 digits." });
      return;
    }
    if (sellForm.phoneNumber.length !== 11) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Phone number must be 11 digits." });
      return;
    }

    setIsSubmitting(true);
    const price = calculateSellPrice(sellForm.phoneNumber);

    try {
      await addDoc(collection(firestore, "number_listings"), {
        ...sellForm,
        userId: user.id,
        price: price,
        type: "sale",
        status: "pending_verification",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Listing Submitted",
        description: `Your number ${sellForm.phoneNumber} is being verified. Potential value: ₦${price.toLocaleString()}`,
      });
      setView("menu");
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Could not submit listing." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header with 4 buttons */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              if (view === "menu") router.back();
              else setView("menu");
            }} className="rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Number Center</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={view.includes("buy") ? "default" : "outline"} 
              className="h-12 rounded-xl text-xs font-bold"
              onClick={() => setView("buy_rules")}
            >
              BUY NUMBER
            </Button>
            <Button 
              variant={view.includes("sell") ? "default" : "outline"} 
              className="h-12 rounded-xl text-xs font-bold"
              onClick={() => setView("sell_rules")}
            >
              SELL NUMBER
            </Button>
            <Button 
              variant={view === "validation" ? "default" : "outline"} 
              className="h-12 rounded-xl text-xs font-bold"
              onClick={() => setView("validation")}
            >
              VALIDATION
            </Button>
            <Button 
              variant="outline" 
              className="h-12 rounded-xl text-xs font-bold"
              onClick={() => toast({ title: "Coming Soon", description: "Name Search is being integrated." })}
            >
              NAME SEARCH
            </Button>
          </div>
        </div>

        {view === "menu" && (
          <Card className="border-none shadow-sm bg-primary/5 rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Smartphone className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold">Global Number Exchange</h2>
              <p className="text-sm text-muted-foreground">Get a unique Lere Connect identity or monetize your existing lines safely.</p>
            </CardContent>
          </Card>
        )}

        {view === "buy_rules" && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-primary p-6 text-white text-center">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold">Rules & Regulations</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                <li>Numbers purchased on Lere Connect are strictly for personal or business use.</li>
                <li>You must provide valid NIN details for registration.</li>
                <li>Purchased numbers are non-refundable after successful activation.</li>
                <li>One user can own a maximum of 5 active Lere numbers.</li>
              </ul>
              <Button className="w-full h-14 bg-primary rounded-2xl font-bold" onClick={() => setView("buy_list")}>
                I Agree, View Numbers
              </Button>
            </CardContent>
          </Card>
        )}

        {view === "buy_list" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Available Numbers</h3>
            {loadingAvailable ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : !availableNumbers || availableNumbers.length === 0 ? (
              <Card className="border-none shadow-sm bg-slate-50 p-12 rounded-3xl text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-sm text-muted-foreground italic">No numbers currently available for purchase.</p>
              </Card>
            ) : (
              availableNumbers.map((num) => (
                <Card key={num.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleBuyNumber(num)}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-lg">{num.number}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Verified Line</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 font-bold">₦{num.price.toLocaleString()}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {view === "sell_rules" && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <Tag className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold">Selling Regulations</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                <li>You must be the verified owner of the number you are listing.</li>
                <li>Standard prefixes (081, 091, 070) yield a value of ₦2,500.</li>
                <li>Other prefixes yield a value of ₦2,000.</li>
                <li>Verification takes 24-48 hours. Payments are credited to your wallet.</li>
              </ul>
              <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold" onClick={() => setView("sell_form")}>
                Understand, Sell Number
              </Button>
            </CardContent>
          </Card>
        )}

        {view === "sell_form" && (
          <Card className="border-none shadow-xl rounded-3xl bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required placeholder="John" className="h-12 rounded-xl" value={sellForm.firstName} onChange={(e) => setSellForm({...sellForm, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required placeholder="Doe" className="h-12 rounded-xl" value={sellForm.lastName} onChange={(e) => setSellForm({...sellForm, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Middle Name (Optional)</Label>
                  <Input placeholder="Enter middle name" className="h-12 rounded-xl" value={sellForm.middleName} onChange={(e) => setSellForm({...sellForm, middleName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>11 Digit NIN</Label>
                  <Input required placeholder="00000000000" maxLength={11} className="h-12 rounded-xl" value={sellForm.nin} onChange={(e) => setSellForm({...sellForm, nin: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>11 Digit Phone Number</Label>
                  <Input required placeholder="080..." maxLength={11} className="h-12 rounded-xl" value={sellForm.phoneNumber} onChange={(e) => setSellForm({...sellForm, phoneNumber: e.target.value})} />
                </div>

                {sellForm.phoneNumber.length >= 3 && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200 text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Estimated Payout</p>
                    <h2 className="text-2xl font-bold text-emerald-600">₦{calculateSellPrice(sellForm.phoneNumber).toLocaleString()}</h2>
                  </div>
                )}

                <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit for Verification"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {view === "validation" && (
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
              <div className="bg-slate-900 p-8 text-white text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-bold">Line Validation</h2>
                <p className="text-white/40 text-xs">Confirm your registration status</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label>Enter Phone Number to Validate</Label>
                  <Input placeholder="080..." maxLength={11} className="h-14 rounded-2xl text-center text-xl font-bold border-2" />
                </div>
                <Button className="w-full h-14 bg-primary rounded-2xl font-bold shadow-lg">
                  Perform Validation
                </Button>
                
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium flex gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Line validation ensures your number is fully compliant with Lere Connect and national regulations.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
