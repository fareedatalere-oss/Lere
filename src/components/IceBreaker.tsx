
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { generateCallIceBreaker } from "@/ai/flows/generate-call-ice-breaker";
import { Card, CardContent } from "@/components/ui/card";

export function IceBreaker() {
  const [iceBreaker, setIceBreaker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getIceBreaker = async () => {
    setLoading(true);
    try {
      const result = await generateCallIceBreaker();
      setIceBreaker(result);
    } catch (error) {
      console.error("Failed to fetch ice breaker", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" /> AI Ice-Breaker
        </h3>
        {iceBreaker && (
          <Button variant="ghost" size="sm" onClick={getIceBreaker} disabled={loading} className="h-8 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Refresh
          </Button>
        )}
      </div>

      {!iceBreaker ? (
        <Card className="border-dashed border-2 bg-accent/50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <p className="text-xs text-muted-foreground">Not sure what to say? Let AI help you start the conversation.</p>
            <Button size="sm" onClick={getIceBreaker} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Ice-Breaker
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium italic text-primary-foreground/90 bg-primary/10 rounded-lg p-3 border border-primary/10">
              "{iceBreaker}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
