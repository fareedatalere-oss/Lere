
"use client";

import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Video, Phone, Shield, Globe, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary font-bold text-2xl">Lere Tele App...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold text-primary">Lere Tele App</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => router.push("/login")}>Login</Button>
          <Button onClick={() => router.push("/signup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-8 max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium animate-bounce">
          <Zap className="h-4 w-4" /> Connect Globally, Instantly
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
          Talk to anyone, <span className="text-primary">anywhere.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl">
          High-quality video and voice calls with built-in financial tools. Airtime to cash, instant transfers, and AI-powered conversation starters.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Button size="lg" className="h-16 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-xl" onClick={() => router.push("/signup")}>
            Start Calling Now <ArrowRight className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-8 text-lg rounded-2xl border-2" onClick={() => router.push("/login")}>
            Sign In to Account
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 w-full text-left">
          <div className="p-6 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">HD Video Calls</h3>
            <p className="text-sm text-muted-foreground">Crystal clear video connection optimized for low-bandwidth areas.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Secure Wallet</h3>
            <p className="text-sm text-muted-foreground">Integrated digital wallet for airtime, data, and secure money transfers.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 bg-accent-foreground/10 rounded-2xl flex items-center justify-center text-accent-foreground">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Global Reach</h3>
            <p className="text-sm text-muted-foreground">Connect with users across the globe without high international fees.</p>
          </div>
        </div>
      </main>

      <footer className="p-8 border-t bg-white text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Lere Tele App. All rights reserved.
      </footer>
    </div>
  );
}
