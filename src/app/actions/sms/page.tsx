"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SMSPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "SMS Sent",
      description: "Your message is being delivered.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Send SMS</h1>
        </div>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6">
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Recipient Number</label>
                <Input placeholder="+234..." required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Message</label>
                <Textarea placeholder="Type your message here..." className="min-h-[150px]" required />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
