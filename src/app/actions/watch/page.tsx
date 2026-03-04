
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, Coins, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

export default function WatchPage() {
  const router = useRouter();
  const { user, addReward } = useUser();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            handleReward();
            return 100;
          }
          return prev + 2;
        });
      }, 500);
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

        <Card className="border-none shadow-xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center">
          {isPlaying ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-white text-sm font-bold">Streaming Reward Content...</p>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Button size="lg" className="rounded-full h-20 w-20 p-0 bg-primary/20 hover:bg-primary/30 text-primary border-4 border-primary" onClick={startVideo}>
                <PlayCircle className="h-10 w-10" />
              </Button>
              <p className="text-white/60 text-xs">Tap to watch and earn ₦5.50</p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm p-4 bg-white">
            <div className="flex flex-col items-center text-center space-y-1">
              <Coins className="h-6 w-6 text-yellow-500" />
              <p className="text-xs text-muted-foreground uppercase">Earned Today</p>
              <p className="font-bold">₦{isRewarded ? "5.50" : "0.00"}</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm p-4 bg-white">
            <div className="flex flex-col items-center text-center space-y-1">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-xs text-muted-foreground uppercase">Total Points</p>
              <p className="font-bold">{user?.rewardBalance?.toFixed(2) || "0.00"}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Next Rewards</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <PlayCircle className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium">Video Content #{i + 1}</span>
                </div>
                <span className="text-xs font-bold text-green-600">₦5.50</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
