
"use client";

import { UserProvider, useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Phone, Lock, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function ProfileContent() {
  const { user, signup } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    pin: user?.pin || "",
  });

  if (!user) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    signup({
      ...user,
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      pin: formData.pin,
    });
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-8 border-b">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-white shadow-xl">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">{user.username}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="username" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pin" 
                    type="password" 
                    value={formData.pin} 
                    onChange={(e) => setFormData({...formData, pin: e.target.value})} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 rounded-xl">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <UserProvider>
      <ProfileContent />
    </UserProvider>
  );
}
