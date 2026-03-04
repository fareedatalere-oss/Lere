
"use client";

import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Mic, 
  ScanFace, 
  Lock, 
  KeyRound, 
  Hash, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  if (!user) return null;

  const handleAction = (action: string) => {
    toast({
      title: action,
      description: "This feature is coming soon in the next update.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-3 pb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              <User className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-white shadow-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
            <p className="text-muted-foreground font-mono text-sm">{user.phoneNumber}</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">Security Settings</h3>
          
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y">
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => handleAction("Add Voice Lock")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Add Voice Lock</p>
                    <p className="text-[10px] text-muted-foreground">Secure calls with your voice</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => handleAction("Add Face Lock")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                    <ScanFace className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Add Face Lock</p>
                    <p className="text-[10px] text-muted-foreground">Unlock with facial recognition</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => handleAction("Change Password")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Change Password</p>
                    <p className="text-[10px] text-muted-foreground">Update your login security</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => handleAction("Change Transaction PIN")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Change Transaction PIN</p>
                    <p className="text-[10px] text-muted-foreground">Manage your 4-digit security code</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1 pt-2">Account Management</h3>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y">
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => handleAction("Buy New Number")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Buy New Number</p>
                    <p className="text-[10px] text-muted-foreground">Add secondary line to your account</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="p-4 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center border shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Lere Verified</p>
                    <p className="text-[10px] text-muted-foreground">Your account is fully secured</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl border-2 border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
          onClick={() => toast({ title: "Account Deletion", description: "Please contact support to delete account." })}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}
