
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore, auth } = useFirebase();
  const { toast } = useToast();
  
  const [view, setView] = useState<"menu" | "pin" | "password" | "username">("menu");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleUpdate = async (type: string) => {
    if (!user?.id || !firestore) return;
    
    if (formData.new !== formData.confirm) {
      toast({ variant: "destructive", title: "Error", description: "New values do not match." });
      return;
    }

    setIsLoading(true);
    try {
      if (type === "pin") {
        if (formData.current !== user.pin) throw new Error("Current PIN is incorrect.");
        await updateDoc(doc(firestore, "users", user.id), { pin: formData.new });
      } else if (type === "username") {
        await updateDoc(doc(firestore, "users", user.id), { username: formData.new });
      } else if (type === "password") {
        if (auth.currentUser) {
           await updatePassword(auth.currentUser, formData.new);
        }
      }
      
      toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully.` });
      setView("menu");
      setFormData({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => view === "menu" ? router.back() : setView("menu")} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">General Settings</h1>
        </div>

        {view === "menu" ? (
          <div className="grid gap-3">
            <button className="w-full p-6 bg-white rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-all text-left" onClick={() => setView("pin")}>
              <div><h3 className="font-bold">Change Transaction PIN</h3><p className="text-xs text-muted-foreground">Manage your 4-digit security PIN</p></div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="w-full p-6 bg-white rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-all text-left" onClick={() => setView("password")}>
              <div><h3 className="font-bold">Change Password</h3><p className="text-xs text-muted-foreground">Update your account login password</p></div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="w-full p-6 bg-white rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-all text-left" onClick={() => setView("username")}>
              <div><h3 className="font-bold">Change Username</h3><p className="text-xs text-muted-foreground">Update your public profile name</p></div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-primary p-6 text-white text-center">
              <Settings className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold">Update {view.charAt(0).toUpperCase() + view.slice(1)}</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Current {view.charAt(0).toUpperCase() + view.slice(1)}</Label>
                <Input 
                  type={view === "pin" ? "password" : "text"} 
                  className="h-12 rounded-xl"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New {view.charAt(0).toUpperCase() + view.slice(1)}</Label>
                <Input 
                  type={view === "pin" ? "password" : "text"} 
                  className="h-12 rounded-xl"
                  value={formData.new}
                  onChange={(e) => setFormData({ ...formData, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New {view.charAt(0).toUpperCase() + view.slice(1)}</Label>
                <Input 
                  type={view === "pin" ? "password" : "text"} 
                  className="h-12 rounded-xl"
                  value={formData.confirm}
                  onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                />
              </div>
              <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold" disabled={isLoading} onClick={() => handleUpdate(view)}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                Confirm Update
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
