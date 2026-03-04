"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { User, Phone, Lock, Hash, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    pin: "",
    password: "",
    referralCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup({
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        pin: formData.pin,
        accountNumber: "ACC" + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        balance: 5000.00, // Initial sign up bonus
      });
      toast({
        title: "Account Created",
        description: "Welcome to Lere Connect!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during signup.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Lere Connect</CardTitle>
          <p className="text-muted-foreground">Create your account to start calling.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="username" placeholder="johndoe" className="pl-10" onChange={handleChange} required disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phoneNumber" placeholder="08012345678" className="pl-10" onChange={handleChange} required disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="********" className="pl-10" onChange={handleChange} required disabled={isSubmitting} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="pin" type="password" placeholder="****" className="pl-10" maxLength={4} onChange={handleChange} required disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral (Optional)</Label>
                <div className="relative">
                  <Star className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="referralCode" placeholder="ABC123" className="pl-10" onChange={handleChange} disabled={isSubmitting} />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg mt-4 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}