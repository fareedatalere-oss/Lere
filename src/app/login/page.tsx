
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Phone, Lock, Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MANAGER_PHONE = "0812792912208167929127";
const MANAGER_PIN = "816281";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Manager Override Check
    if (phoneNumber === MANAGER_PHONE && pin === MANAGER_PIN) {
      toast({ title: "Manager Detected", description: "Proceeding to security check." });
      router.push("/admin/security-check");
      return;
    }

    try {
      await login(phoneNumber, pin);
      toast({
        title: "Login Successful",
        description: "Welcome back to Lere Connect!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Incorrect phone number or transaction PIN.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Lere Connect</CardTitle>
          <p className="text-muted-foreground">Welcome back! Please login.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="08012345678"
                  className="pl-10 h-12 rounded-xl"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="****"
                  className="pl-10 h-12 rounded-xl"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg mt-4 bg-primary hover:bg-primary/90 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest bg-slate-50 p-2 rounded-lg">
            <ShieldAlert className="h-3 w-3" /> Secure Banking Standards Applied
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
