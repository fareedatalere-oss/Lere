
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck, Loader2, BookCheck, Wallet } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { MASTER_LIBRARY } from "../../library-data";

export default function BuyBookPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const book = useMemo(() => MASTER_LIBRARY.find(b => b.id === bookId), [bookId]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    // Handle user-published books if not in MASTER_LIBRARY
    let targetBook = book;
    let publisherId = null;

    if (!targetBook) {
      const bookDoc = await getDoc(doc(firestore, "published_books", bookId as string));
      if (bookDoc.exists()) {
        const data = bookDoc.data();
        targetBook = { id: bookDoc.id, ...data } as any;
        publisherId = data.publisherId;
      }
    }

    if (!targetBook) {
      toast({ variant: "destructive", title: "Error", description: "Book details not found." });
      return;
    }

    if (pin !== user.pin) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Incorrect transaction PIN." });
      return;
    }

    if (user.balance < targetBook.price) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: "Please fund your wallet." });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Debit Buyer
      const userRef = doc(firestore, "users", user.id!);
      await updateDoc(userRef, { balance: increment(-targetBook.price) });

      // 2. Credit Publisher (if it's a user book)
      if (publisherId) {
        const sellerEarnings = targetBook.price - 80;
        if (sellerEarnings > 0) {
          const sellerRef = doc(firestore, "users", publisherId);
          await updateDoc(sellerRef, { balance: increment(sellerEarnings) });
        }
      }

      await addDoc(collection(firestore, "transactions"), {
        userId: user.id,
        type: "Book Purchase",
        amount: targetBook.price,
        recipient: targetBook.title,
        status: "Success",
        createdAt: serverTimestamp()
      });

      const saved = localStorage.getItem("my_owned_books");
      const owned = saved ? JSON.parse(saved) : [];
      if (!owned.includes(targetBook.id)) {
        owned.push(targetBook.id);
        localStorage.setItem("my_owned_books", JSON.stringify(owned));
      }

      toast({ title: "Purchase Successful", description: `You now own ${targetBook.title}.` });
      router.push("/library");
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: "Could not process purchase." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!book && !bookId) return <div className="p-10 text-center">Loading book...</div>;

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-emerald-600 p-8 text-white text-center">
            <BookCheck className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold">Secure Purchase</h2>
            <p className="text-white/70 text-sm">{book?.title || "Educational Material"}</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed space-y-2">
              <div className="flex justify-between text-sm">
                <span>Book Price:</span>
                <span className="font-bold">₦{book?.price.toLocaleString() || "..."}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 text-primary font-bold">
                <span>Total Debit:</span>
                <span>₦{book?.price.toLocaleString() || "..."}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase">
              <Wallet className="h-4 w-4" /> Your Balance: ₦{user?.balance.toLocaleString()}
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Enter Transaction PIN</Label>
                <Input 
                  type="password" 
                  placeholder="****" 
                  maxLength={4} 
                  required 
                  className="h-14 text-center text-2xl tracking-[1em] rounded-2xl"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold text-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Pay Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
