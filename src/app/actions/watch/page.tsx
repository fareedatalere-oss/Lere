
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, Coins, Loader2, Sparkles, ShieldCheck, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import Script from "next/script";

export default function WatchPage() {
  const router = useRouter();
  const { user, addReward } = useUser();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1; // Smooth 10-second progress
          if (next >= 100) {
            setIsPlaying(false);
            handleReward();
            return 100;
          }
          return next;
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleReward = async () => {
    if (isRewarded) return;
    setIsRewarded(true);
    await addReward(5.50);
    toast({
      title: "Reward Earned!",
      description: "₦5.50 has been added to your reward balance.",
    });
  };

  const startVideo = () => {
    setIsPlaying(true);
    setProgress(0);
    setIsRewarded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Adsterra Script with User Token */}
      <Script 
        id="adsterra-ads"
        strategy="afterInteractive"
        src={`//pl25746411.profitablecpmrate.com/2a/9e/ca/2a9eca2f7afad5f2e3c125ac2e9528bb.js`} 
      />

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Watch & Earn</h1>
        </div>

        <Card className="border-none shadow-xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center rounded-3xl">
          {isPlaying ? (
            <div className="w-full h-full relative">
              <video 
                ref={videoRef}
                src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-slow-motion-4105-preview.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Streaming Ad Unit...</p>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden max-w-[200px]">
                  <div 
                    className="bg-primary h-full transition-all duration-100 ease-linear" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-white/60 text-[8px] uppercase font-bold">
                  <Radio className="h-2 w-2 animate-pulse text-red-500" /> Secure Ad Stream Active
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Button size="lg" className="rounded-full h-20 w-20 p-0 bg-primary/20 hover:bg-primary/30 text-primary border-4 border-primary" onClick={startVideo}>
                <PlayCircle className="h-10 w-10" />
              </Button>
              <div className="text-center">
                <p className="text-white font-bold">Ad Ready</p>
                <p className="text-white/60 text-[10px] uppercase tracking-tighter">Earn ₦5.50 after viewing</p>
              </div>
            </div>
          )}
        </Card>

        <div className="p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/20 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-[10px] font-bold uppercase text-primary leading-tight">Secured by Adsterra Network<br/><span className="text-muted-foreground opacity-60 font-mono">Token: 2a9eca2f...8bb</span></p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm p-4 bg-white rounded-2xl">
            <div className="flex flex-col items-center text-center space-y-1">
              <Coins className="h-6 w-6 text-yellow-500" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Earned Today</p>
              <p className="text-lg font-bold">₦{isRewarded ? "5.50" : "0.00"}</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm p-4 bg-white rounded-2xl">
            <div className="flex flex-col items-center text-center space-y-1">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Rewards</p>
              <p className="text-lg font-bold">₦{user?.rewardBalance?.toFixed(2) || "0.00"}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-lg">Next Rewards</h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Refreshing in 2h</span>
          </div>
          <div className="space-y-3">
            {[2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-not-allowed opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Partner Ad #{i}</p>
                    <p className="text-[10px] text-muted-foreground">Premium Reward</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-green-600">₦5.50</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
