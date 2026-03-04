"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search, 
  Library, 
  BookOpen, 
  FlaskConical, 
  Cpu, 
  Heart, 
  Cross,
  ChevronRight,
  Download,
  BookMarked
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Category = "All" | "Science" | "ICT" | "Qur'an" | "Hadiths" | "Islam" | "Christian";

interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
  parts: number;
  cover: string;
}

const SAMPLE_BOOKS: Book[] = [
  { id: "1", title: "Introduction to Physics", author: "Dr. Albert", category: "Science", parts: 45, cover: "https://picsum.photos/seed/sci1/200/300" },
  { id: "2", title: "Modern Web Development", author: "Lere Dev", category: "ICT", parts: 100, cover: "https://picsum.photos/seed/ict1/200/300" },
  { id: "3", title: "The Holy Qur'an", author: "Prophetic Revelation", category: "Qur'an", parts: 114, cover: "https://picsum.photos/seed/quran1/200/300" },
  { id: "4", title: "Sahih al-Bukhari", author: "Imam Bukhari", category: "Hadiths", parts: 97, cover: "https://picsum.photos/seed/hadith1/200/300" },
  { id: "5", title: "Islamic Jurisprudence", author: "Sheikh Amin", category: "Islam", parts: 60, cover: "https://picsum.photos/seed/islam1/200/300" },
  { id: "6", title: "The Holy Bible", author: "Apostolic Writers", category: "Christian", parts: 66, cover: "https://picsum.photos/seed/bible1/200/300" },
  { id: "7", title: "Quantum Computing", author: "Jane Quantum", category: "Science", parts: 30, cover: "https://picsum.photos/seed/sci2/200/300" },
  { id: "8", title: "AI and Machine Learning", author: "Deep Mind", category: "ICT", parts: 85, cover: "https://picsum.photos/seed/ict2/200/300" },
];

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"landing" | "books">("landing");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { name: Category; icon: any; color: string }[] = [
    { name: "Science", icon: FlaskConical, color: "text-blue-500 bg-blue-50" },
    { name: "ICT", icon: Cpu, color: "text-indigo-500 bg-indigo-50" },
    { name: "Qur'an", icon: BookMarked, color: "text-green-600 bg-green-50" },
    { name: "Hadiths", icon: Heart, color: "text-emerald-500 bg-emerald-50" },
    { name: "Islam", icon: Library, color: "text-teal-500 bg-teal-50" },
    { name: "Christian", icon: Cross, color: "text-purple-500 bg-purple-50" },
  ];

  const filteredBooks = SAMPLE_BOOKS.filter(book => {
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGetBook = (title: string) => {
    toast({
      title: "Downloading...",
      description: `${title} is being added to your offline library.`,
    });
  };

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Lere Library</h1>
          </div>

          <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10 rotate-12 scale-150">
              <Library size={180} />
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">The Knowledge Hub</h2>
                <p className="text-primary-foreground/80">Browse over 1000 world books, religious texts, and ICT resources.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md rounded-xl h-14" onClick={() => setView("books")}>
                  <Library className="h-5 w-5 mr-2" /> Library
                </Button>
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 rounded-xl h-14" onClick={() => setView("books")}>
                  <BookOpen className="h-5 w-5 mr-2" /> Books
                </Button>
              </div>
            </CardContent>
          </Card>

          <h3 className="font-bold text-lg">Browse by Category</h3>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Button 
                key={cat.name} 
                variant="outline" 
                className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setView("books");
                }}
              >
                <div className={`w-10 h-10 ${cat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold">{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView("landing")} className="rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">World Library</h1>
              <p className="text-xs text-muted-foreground">Listing 1,000+ available titles</p>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by title, author, or keywords..." 
              className="pl-10 h-12 bg-white rounded-xl border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              size="sm" 
              variant={selectedCategory === "All" ? "default" : "outline"} 
              className="rounded-full px-4"
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.name}
                size="sm" 
                variant={selectedCategory === cat.name ? "default" : "outline"} 
                className="rounded-full px-4 flex items-center gap-1 shrink-0"
                onClick={() => setSelectedCategory(cat.name)}
              >
                <cat.icon className="h-3 w-3" /> {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
              <div className="flex h-44">
                <div className="w-32 shrink-0 bg-slate-100 p-2">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-md shadow-sm" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 mb-1">
                      {book.category}
                    </Badge>
                    <h4 className="font-bold text-sm leading-tight line-clamp-2">{book.title}</h4>
                    <p className="text-[10px] text-muted-foreground italic">by {book.author}</p>
                    <p className="text-[10px] font-medium text-secondary mt-1">{book.parts} Parts Included</p>
                  </div>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 h-8 text-xs font-bold" onClick={() => handleGetBook(book.title)}>
                    <Download className="h-3 w-3 mr-1" /> GET
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <Library className="h-16 w-16 text-muted/30 mx-auto" />
            <p className="text-muted-foreground">No books found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
