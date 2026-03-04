
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Phone, Mail, Globe, Headset } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Contact Us</h1>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Headset className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Support Center</h3>
                <p className="text-xs text-muted-foreground">We are here to help you 24/7</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md">
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-semibold">Call Support</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="text-xs font-semibold">WhatsApp</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md">
                <Mail className="h-5 w-5 text-red-500" />
                <span className="text-xs font-semibold">Email Us</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md">
                <Globe className="h-5 w-5 text-purple-500" />
                <span className="text-xs font-semibold">Website</span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
