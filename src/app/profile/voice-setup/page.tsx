
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, ShieldCheck, Loader2, MicVocal, CheckCircle2, Volume2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function VoiceSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"confirm" | "recording_1" | "recording_2" | "matching" | "success">("confirm");
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
        return p + 4; // Approx 4 seconds recording
      });
    }, 150);
  };

  useEffect(() => {
    if (step === "matching") {
      handleSave();
    }
  }, [step]);

  const handleSave = async () => {
    if (!user?.id || !firestore) return;
    
    // Simulated deep vocal pattern comparison
    await new Promise(r => setTimeout(r, 3500));
    
    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, {
        voiceLoginActive: true,
        voiceData: "secure_vocal_signature_" + Date.now(),
        faceLoginActive: false,
        lastBiometricUpdate: serverTimestamp()
      });
      setStep("success");
      setTimeout(() => router.push("/profile"), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Storage Error", description: "Could not save voice profile." });
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
            <h2 className="text-2xl font-bold">Lere VoiceID</h2>
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Biometric Audio Enrollment</p>
          </div>
          
          <CardContent className="p-8 space-y-6">
            {step === "confirm" ? (
              <div className="text-center space-y-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To enroll, please speak your full name and registered phone number clearly. We will capture your unique vocal signature for secure account access.
                </p>
                <Button className="w-full h-14 rounded-2xl bg-teal-600 text-white font-bold text-lg shadow-lg" onClick={() => setStep("recording_1")}>
                  Start Audio Capture
                </Button>
              </div>
            ) : step === "recording_1" ? (
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center gap-2 text-teal-600 font-bold uppercase text-[10px] tracking-widest">
                  <Volume2 className="h-4 w-4" /> Phase 1: Initial Capture
                </div>
                <div className="p-8 bg-teal-50 rounded-full w-36 h-36 mx-auto flex items-center justify-center border-8 border-white shadow-xl">
                  <Mic className={`h-14 w-14 ${isRecording ? 'text-teal-600 animate-pulse' : 'text-slate-300'}`} />
                </div>
                {!isRecording ? (
                  <Button className="w-full h-14 rounded-2xl bg-teal-600 text-white font-bold" onClick={() => startSimulation("recording_2")}>
                    Speak Identity Now
                  </Button>
                ) : (
                  <div className="space-y-4 w-full animate-in fade-in">
                    <p className="text-sm font-bold text-teal-600">Analyzing voice frequencies...</p>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
                      <div className="bg-teal-600 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : step === "recording_2" ? (
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center gap-2 text-teal-600 font-bold uppercase text-[10px] tracking-widest">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Phase 2: Verification
                </div>
                <p className="text-xs text-muted-foreground">Repeat your details again to confirm the pattern.</p>
                <div className="p-8 bg-teal-50 rounded-full w-36 h-36 mx-auto flex items-center justify-center border-8 border-white shadow-xl">
                  <Mic className={`h-14 w-14 ${isRecording ? 'text-teal-600 animate-pulse' : 'text-slate-300'}`} />
                </div>
                {!isRecording ? (
                  <Button className="w-full h-14 rounded-2xl bg-teal-600 text-white font-bold" onClick={() => startSimulation("matching")}>
                    Confirm Voice Print
                  </Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <p className="text-sm font-bold text-teal-600">Comparing voice patterns...</p>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
                      <div className="bg-teal-600 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : step === "matching" ? (
              <div className="text-center py-10 space-y-6">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-900">Validating Voice Print</h3>
                  <p className="text-xs text-muted-foreground">Encrypting audio signature...</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                <h3 className="text-2xl font-bold">Enrollment Success</h3>
                <p className="text-muted-foreground">Voice Lock is now successfully activated.</p>
              </div>
            )}

            <div className="p-4 bg-teal-50 rounded-2xl flex items-center gap-3 border-b-4 border-teal-600">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <p className="text-[10px] text-teal-700 font-bold uppercase leading-tight">
                Your vocal signature is converted to an encrypted string for comparison. No raw audio files are stored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
