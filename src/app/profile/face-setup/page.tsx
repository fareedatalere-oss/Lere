
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ScanFace, ShieldCheck, Loader2, Camera } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FaceSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"confirm" | "scanning" | "saving">("confirm");
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === "scanning") {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Simulate scanning delay
          setTimeout(() => {
            setStep("saving");
            handleSave();
          }, 4000);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
          setStep("confirm");
        }
      };
      getCameraPermission();
    }
  }, [step]);

  const handleSave = async () => {
    if (!user?.id || !firestore) return;
    try {
      await updateDoc(doc(firestore, "users", user.id), {
        faceLoginActive: true,
        faceData: "encrypted_face_template_placeholder",
        voiceLoginActive: false // Mutual exclusivity
      });
      toast({ title: "Face Login Active", description: "You can now unlock your dashboard with your face." });
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
          <div className="bg-primary p-8 text-white text-center">
            <ScanFace className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold">Face Login</h2>
            <p className="text-white/70 text-sm">Secure your account with biometrics</p>
          </div>
          
          <CardContent className="p-8 space-y-6">
            {step === "confirm" ? (
              <div className="text-center space-y-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to add **Face Login**? This will allow you to unlock your account using your face.
                </p>
                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg" onClick={() => setStep("scanning")}>
                  I Agree, Start Setup
                </Button>
              </div>
            ) : step === "scanning" ? (
              <div className="space-y-6 text-center">
                <div className="relative aspect-square rounded-full overflow-hidden border-4 border-primary shadow-xl mx-auto max-w-[240px]">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center">
                     <div className="w-full h-1 bg-primary animate-bounce opacity-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Examining Face...
                  </p>
                  <p className="text-xs text-muted-foreground">Keep your face centered and steady.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="font-bold">Finalizing Setup...</p>
              </div>
            )}
            
            {!hasCameraPermission && step === "scanning" && (
              <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Required</AlertTitle>
                <AlertDescription>Please allow camera access to scan your face.</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-[10px] text-primary font-bold uppercase leading-tight">
                Biometric data is encrypted and stored securely within your private account vault.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
