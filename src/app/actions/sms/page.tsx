
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  MailOpen, 
  Loader2,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function SMSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [view, setView] = useState<"compose" | "inbox">("inbox");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (view === "inbox") fetchMessages();
  }, [view]);

  const fetchMessages = async () => {
    setIsLoading(true);
    // Simulate fetching messages for the registered phone number
    setTimeout(() => {
      setMessages([
        { id: 1, sender: "Lere Connect", text: "Welcome to your secure SMS center.", date: "2 mins ago" },
        { id: 2, sender: "80ca2a52", text: "Your network connection is secured.", date: "1 hour ago" },
        { id: 3, sender: "Bank Alert", text: "Credit alert for ₦100.00", date: "Today, 10:00 AM" },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "SMS Sent",
      description: "Your message is being delivered.",
    });
    setView("inbox");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">SMS Center</h1>
          </div>
          <Button 
            size="sm" 
            variant={view === "compose" ? "secondary" : "default"}
            onClick={() => setView(view === "compose" ? "inbox" : "compose")}
            className="rounded-full px-4"
          >
            {view === "compose" ? "Inbox" : "Compose"}
          </Button>
        </div>

        {view === "compose" ? (
          <Card className="border-none shadow-lg bg-white rounded-3xl">
            <CardContent className="p-6">
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Recipient Number</label>
                  <Input placeholder="+234..." required className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Message</label>
                  <Textarea placeholder="Type your message here..." className="min-h-[150px] rounded-2xl" required />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-bold text-lg">
                  <Send className="h-5 w-5 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground pl-1">
              <MailOpen className="h-3 w-3" /> Messages for {user?.phoneNumber}
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Refreshing inbox...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <Card key={msg.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{msg.sender}</h4>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2 w-2" /> {msg.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{msg.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
