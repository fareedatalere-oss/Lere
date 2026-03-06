
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookPlus, Loader2, Sparkles, ShieldCheck, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

export default function PublishBookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [pin, setPin] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Science",
    summary: "",
    price: "0",
  });

  const checkAccess = () => {
    if (!user) return false;
    if (!user.freePublishUsed) return true;
    if (user.publishingSubscriptionExpiry) {
      const expiry = new Date(user.publishingSubscriptionExpiry);
      return expiry > new Date();
    }
    return false;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    if (user.balance < 2500) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: "₦2,500 required for monthly publishing." });
      return;
    }

    setIsSubmitting(true);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, {
        balance: increment(-2500),
        publishingSubscriptionExpiry: expiryDate.toISOString(),
      });

      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Publishing Subscription",
        amount: 2500,
        status: "Success",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Subscribed Successfully", description: "You can now publish books daily for 30 days." });
      setShowSubscription(false);
      setPin("");
    } catch (err) {
      toast({ variant: "destructive", title: "Subscription Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    if (!checkAccess()) {
      setShowSubscription(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, "published_books"), {
        ...formData,
        price: parseFloat(formData.price),
        publisherId: user.id,
        publisherName: user.username,
        createdAt: serverTimestamp(),
      });

      if (!user.freePublishUsed) {
        await updateDoc(doc(firestore, "users", user.id), { freePublishUsed: true });
      }

      toast({
        title: "Book Published",
        description: "Your knowledge has been shared with the world!",
      });
      router.push("/library");
    } catch (err) {
      toast({ variant: "destructive", title: "Publishing Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSubscription) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-primary p-8 text-white text-center">
              <BookPlus className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Publishing Limit</h2>
              <p className="text-white/70 text-sm mt-2">You've used your free limit.</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed text-center">
                <p className="text-sm font-bold text-primary">Monthly Publishing Access</p>
                <h1 className="text-3xl font-bold my-2">₦2,500</h1>
                <p className="text-[10px] text-muted-foreground uppercase">Unlimited daily publishing for 30 days</p>
              </div>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label>Transaction PIN</Label>
                  <Input type="password" maxLength={4} required placeholder="****" className="h-14 text-center text-2xl tracking-[1em] rounded-2xl" value={pin} onChange={(e) => setPin(e.target.value)} />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary rounded-2xl font-bold text-lg shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm & Pay ₦2,500"}
                </Button>
                <Button variant="ghost" className="w-full h-12" onClick={() => setShowSubscription(false)}>Cancel</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categories = [
    "Science", "ICT", "Hadiths", "Islam", "Christian", "History", "Laws", 
    "Philosophy", "Literature", "Arts", "Biographies", "Economics", 
    "Health", "Physiology", "Psychology", "Engineering", "Education", 
    "Civic Education", "Cyber Security", "Government", "Food & Nutrition"
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Publish Knowledge</h1>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-emerald-600 p-6 text-white text-center">
            <BookPlus className="h-10 w-10 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium">Add your own book to the World Library</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Book Title</Label>
                <Input placeholder="e.g. Advanced Physiology" className="h-12 rounded-xl" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input placeholder="Your name" className="h-12 rounded-xl" required value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full h-12 px-3 rounded-xl border bg-background" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price (₦ - Use 0 for FREE)</Label>
                <Input type="number" placeholder="0" className="h-12 rounded-xl" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Short Summary</Label>
                <Textarea placeholder="What is this book about?" className="rounded-2xl min-h-[100px]" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-2 border border-emerald-100">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <p className="text-[10px] text-emerald-800 font-bold uppercase">AI will automatically generate chapters for readers.</p>
              </div>

              <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BookPlus className="h-5 w-5 mr-2" />}
                Publish to Library
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
