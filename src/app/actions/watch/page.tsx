
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, ShieldCheck, ExternalLink, Zap, MonitorPlay } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

export default function WatchPage() {
  const router = useRouter();
  const { user, addReward } = useUser();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const SMART_LINK_ID = "3193409";

  useEffect(() => {
    // Production Adsterra Banner Injection
    // Note: Most ad blockers will prevent this on localhost. Requires a live domain.
    try {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//pl25841234.highperformanceformat.com/23/45/67/23456789.js"; 
      script.async = true;
      script.onerror = () => console.log("Ad script blocked or not available locally");
      
      const container = document.getElementById("ad-container");
      if (container) {
        container.innerHTML = ""; // Clear existing
        container.appendChild(script);
      }
    } catch (e) {
      console.error("Adsterra setup failed", e);
    }
  }, []);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await addReward(2.50);
      toast({
        title: "Reward Earned!",
        description: "₦2.50 added to your rewards instantly.",
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Claim Failed" });
    } finally {
      setIsClaiming(false);
    }
  };

  const openSmartLink = () => {
    window.open(`https://smrturl.co/o/${SMART_LINK_ID}/direct`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Watch & Earn</h1>
        </div>

        {/* Adsterra Production Container */}
        <div id="ad-container" className="w-full bg-slate-100 rounded-xl min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden relative">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <MonitorPlay className="h-6 w-6 text-slate-400 mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sponsored Premium Advertisement</p>
          </div>
        </div>

        <Card className="border-none shadow-xl overflow-hidden bg-slate-900 rounded-3xl aspect-video flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary animate-pulse">
            <Zap className="h-8 w-8" />
          </div>
          <h2 className="text-white font-bold text-xl">Claim ₦2.50</h2>
          <p className="text-white/60 text-xs mt-2 mb-6">Interact with our partners to earn instant wallet credit.</p>
          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold shadow-lg"
            onClick={handleClaim}
            disabled={isClaiming}
          >
            {isClaiming ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Claim Reward"}
          </Button>
        </Card>

        <Button 
          variant="outline" 
          className="w-full h-16 rounded-2xl bg-white border-2 border-primary/20 text-primary font-bold shadow-md flex items-center justify-center gap-3 hover:bg-primary/5"
          onClick={openSmartLink}
        >
          <ExternalLink className="h-5 w-5" />
          Visit Smart Portal: {SMART_LINK_ID}
        </Button>

        <div className="p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/20 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-[10px] font-bold uppercase text-primary leading-tight">
            Verified by Lere Connect & Adsterra Ad-Verification Standards
          </p>
        </div>

        <Card className="border-none shadow-sm p-4 bg-white rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Reward Balance</p>
              <p className="text-lg font-bold">₦{user?.rewardBalance?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/actions/fund")} className="text-primary font-bold">Withdraw</Button>
        </Card>
      </div>
    </div>
  );
}
