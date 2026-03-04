
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookPlus, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PublishBookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Science",
    summary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, "published_books"), {
        ...formData,
        publisherId: user.id,
        publisherName: user.username,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Book Published",
        description: "Your knowledge has been shared with the world!",
      });
      router.push("/library");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Publishing Failed",
        description: "Could not save your book. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Input 
                  placeholder="e.g. Advanced Physiology" 
                  className="h-12 rounded-xl"
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input 
                  placeholder="Your name or pen name" 
                  className="h-12 rounded-xl"
                  required 
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="w-full h-12 px-3 rounded-xl border border-input bg-background"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Science</option>
                  <option>ICT</option>
                  <option>Physiology</option>
                  <option>Islam</option>
                  <option>Christian</option>
                  <option>History</option>
                  <option>Philosophy</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Short Summary (Optional)</Label>
                <Textarea 
                  placeholder="What is this book about?" 
                  className="rounded-2xl min-h-[100px]"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-2 border border-emerald-100">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <p className="text-[10px] text-emerald-800 font-bold uppercase">AI will automatically generate full chapters when users read this book.</p>
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
