
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECURITY_PIN = "Abdussalam@100";

export default function SecurityCheckPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (pin === SECURITY_PIN) {
        toast({ title: "Authorized", description: "Welcome, Manager." });
        localStorage.setItem("lere_admin_auth", "true");
        router.push("/admin/dashboard");
      } else {
        toast({ variant: "destructive", title: "Access Denied", description: "Incorrect security credentials." });
        setPin("");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white overflow-hidden rounded-3xl shadow-2xl">
        <div className="bg-primary p-10 text-center">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold">Security Verification</h1>
          <p className="text-white/60 text-sm mt-2">Manager Protocol Required</p>
        </div>
        <CardContent className="p-8 pt-10">
          <form onSubmit={handleCheck} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-400">Enter Security PIN</Label>
              <Input 
                type="password" 
                placeholder="••••••••••••"
                className="h-14 bg-slate-800 border-slate-700 text-center text-xl tracking-widest rounded-2xl focus:ring-primary"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-bold text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Verify Identity"}
            </Button>
            <Button variant="ghost" className="w-full text-slate-500" onClick={() => router.push("/login")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
