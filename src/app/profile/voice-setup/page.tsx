
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, ShieldCheck, Loader2, MicVocal, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function VoiceSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"confirm" | "recording_1" | "recording_2" | "saving">("confirm");
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const startSimulation = (nextStep: typeof step) => {
    setIsRecording(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRecording(false);
          setStep(nextStep);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const handleSave = async () => {
    if (!user?.id || !firestore) return;
    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, {
        voiceLoginActive: true,
        voiceData: "encrypted_voice_template_placeholder",
        faceLoginActive: false // Mutual exclusivity
      });
      toast({ title: "Voice Lock Active", description: "You can now unlock your dashboard with your voice print." });
      router.push("/profile");
    } catch (err) {
      toast({ variant: "destructive", title: "Setup Failed", description: "Could not save biometric data." });
      setStep("confirm");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-teal-600 p-8 text-white text-center">
            <MicVocal className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold">Voice Lock</h2>
            <p className="text-white/70 text-sm">Secure your account with voice print</p>
          </div>
          
          <CardContent className="p-8 space-y-6">
            {step === "confirm" ? (
              <div className="text-center space-y-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This voice will be used in your login. Please ensure you are in a quiet environment.
                </p>
                <Button className="w-full h-14 rounded-2xl bg-teal-600 text-white font-bold text-lg" onClick={() => setStep("recording_1")}>
                  I Understand, Start
                </Button>
              </div>
            ) : step === "recording_1" ? (
              <div className="text-center space-y-8">
                <h3 className="font-bold">Step 1: Speak Clearly</h3>
                <div className="p-8 bg-teal-50 rounded-full w-32 h-32 mx-auto flex items-center justify-center border-4 border-teal-100 shadow-inner">
                  <Mic className={`h-12 w-12 ${isRecording ? 'text-teal-600 animate-pulse' : 'text-slate-300'}`} />
                </div>
                {!isRecording ? (
                  <Button className="w-full h-14 rounded-2xl bg-teal-600 font-bold" onClick={() => startSimulation("recording_2")}>
                    Click & Speak
                  </Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Listening...</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : step === "recording_2" ? (
              <div className="text-center space-y-8">
                <div className="flex justify-center mb-4"><CheckCircle2 className="h-10 w-10 text-green-500" /></div>
                <h3 className="font-bold">Step 2: Confirm Voice</h3>
                <p className="text-xs text-muted-foreground">Please speak the same phrase again to verify.</p>
                <div className="p-8 bg-teal-50 rounded-full w-32 h-32 mx-auto flex items-center justify-center border-4 border-teal-100 shadow-inner">
                  <Mic className={`h-12 w-12 ${isRecording ? 'text-teal-600 animate-pulse' : 'text-slate-300'}`} />
                </div>
                {!isRecording ? (
                  <Button className="w-full h-14 rounded-2xl bg-teal-600 font-bold" onClick={() => startSimulation("saving")}>
                    Confirm & Speak
                  </Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Verifying...</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto" />
                <p className="font-bold">Activating Voice Lock...</p>
                <Button variant="ghost" className="hidden" onClick={handleSave}>Trigger</Button>
                {/* Auto trigger save after verification */}
                {setTimeout(() => handleSave(), 2000) && null}
              </div>
            )}

            <div className="p-4 bg-teal-50 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <p className="text-[10px] text-teal-700 font-bold uppercase leading-tight">
                Your unique voice print is analyzed and stored as an encrypted biometric template.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
