
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search, 
  Library, 
  BookOpen, 
  FlaskConical, 
  Cpu, 
  Heart, 
  Cross,
  Download,
  BookMarked,
  History as HistoryIcon,
  Gavel,
  CheckCircle2,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Category = "All" | "Science" | "ICT" | "Qur'an" | "Hadiths" | "Islam" | "Christian" | "History" | "Laws";

interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
  parts: number;
  cover: string;
}

// Comprehensive generator for exactly 1000 unique book entries
const generate1000Books = (): Book[] => {
  const books: Book[] = [];
  const categories: Category[] = ["Science", "ICT", "Qur'an", "Hadiths", "Islam", "Christian", "History", "Laws"];
  
  const categoryTemplates: Record<Category, string[]> = {
    "Science": ["Physics Fundamentals", "Quantum Mechanics", "Organic Chemistry", "Evolutionary Biology", "Astrophysics", "Genetics Today", "Neuroscience Intro", "General Relativity", "Chemical Engineering", "Botany Studies"],
    "ICT": ["Cloud Architecture", "Python for Data", "Cybersecurity Shield", "React Native Pro", "AI & Ethics", "Blockchain Ledger", "UI/UX Mastery", "System Design", "Networking Basics", "Database Management"],
    "Qur'an": ["Surah Al-Baqarah Study", "The Noble Qur'an", "Tajweed Guide", "Tafsir Al-Jalalayn", "Qur'anic Arabic", "Chronology of Revelation", "Verses of Wisdom", "The Holy Message", "Qur'an Recitation", "Linguistic Miracles"],
    "Hadiths": ["Sahih Al-Bukhari Vol", "Sahih Muslim Gems", "Riyadh as-Salihin", "40 Hadith Nawawi", "Sunan Abi Dawud", "Hadith Science", "The Prophetic Way", "Authentic Narrations", "Ethics in Hadith", "Daily Adhkar"],
    "Islam": ["Fiqh of Worship", "Islamic History", "Lives of Prophets", "Sufism Insights", "Hajj & Umrah Guide", "Zakat Principles", "Islamic Law", "Philosophy of Deen", "Great Scholars", "Modern Islamic Thought"],
    "Christian": ["The Holy Bible (KJV)", "New Testament Study", "Psalms & Proverbs", "Church History", "Systematic Theology", "Gospel Analysis", "Old Testament Kings", "Epistles of Paul", "Biblical Prophecy", "Christian Ethics"],
    "History": ["African Kingdoms", "Ancient Rome", "The Industrial Era", "World War II Docs", "Medieval Europe", "Cold War Secrets", "Ancient Egypt", "History of Nigeria", "The Renaissance", "Global Revolutions"],
    "Laws": ["Constitutional Law", "Criminal Justice", "International Treaties", "Human Rights Law", "Corporate Legalities", "Environmental Acts", "Legal Ethics", "Property Law", "Civil Rights History", "Global Jurisprudence"],
    "All": []
  };

  const authors = ["Dr. Ahmed Lere", "Prof. Jane Smith", "Imam Malik", "Justice Roberts", "Scholar John", "Apostle Paul", "Historian Musa", "Barrister Bello", "Dr. Sarah", "Sheikh Ibrahim"];

  for (let i = 1; i <= 1000; i++) {
    const cat = categories[i % categories.length];
    const templates = categoryTemplates[cat];
    const template = templates[i % templates.length];
    
    books.push({
      id: i.toString(),
      title: `${template} - Part ${Math.floor(i / 8) + 1}`,
      author: authors[i % authors.length],
      category: cat,
      parts: (i % 100) + 1, // Up to 100 parts
      cover: `https://picsum.photos/seed/book${i}/200/300`
    });
  }
  return books;
};

const MASTER_LIBRARY = generate1000Books();

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"landing" | "books">("landing");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categories: { name: Category; icon: any; color: string }[] = [
    { name: "Science", icon: FlaskConical, color: "text-blue-500 bg-blue-50" },
    { name: "ICT", icon: Cpu, color: "text-indigo-500 bg-indigo-50" },
    { name: "Qur'an", icon: BookMarked, color: "text-green-600 bg-green-50" },
    { name: "Hadiths", icon: Heart, color: "text-emerald-500 bg-emerald-50" },
    { name: "Islam", icon: Library, color: "text-teal-500 bg-teal-50" },
    { name: "Christian", icon: Cross, color: "text-purple-500 bg-purple-50" },
    { name: "History", icon: HistoryIcon, color: "text-orange-500 bg-orange-50" },
    { name: "Laws", icon: Gavel, color: "text-slate-600 bg-slate-100" },
  ];

  const filteredBooks = useMemo(() => {
    return MASTER_LIBRARY.filter(book => {
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 100, filteredBooks.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const handleGetBook = (title: string) => {
    toast({
      title: "Downloading...",
      description: `${title} is being added to your offline library.`,
    });
  };

  // Reset visible count when search or category changes
  useEffect(() => {
    setVisibleCount(50);
  }, [selectedCategory, searchQuery]);

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
                <Badge className="bg-white/20 text-white border-none mb-2">1,000+ Titles</Badge>
                <h2 className="text-3xl font-bold">The Knowledge Hub</h2>
                <p className="text-primary-foreground/80">Browse world history, laws, science, and holy scriptures.</p>
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

          <h3 className="font-bold text-lg">Browse Categories</h3>
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" /> Listing {MASTER_LIBRARY.length} available titles
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search 1,000+ books by title or author..." 
              className="pl-10 h-12 bg-white rounded-xl border-none shadow-sm focus-visible:ring-primary"
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
          {filteredBooks.slice(0, visibleCount).map((book) => (
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
                    <p className="text-[10px] font-medium text-secondary mt-1">{book.parts} Parts Available</p>
                  </div>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 h-8 text-xs font-bold" onClick={() => handleGetBook(book.title)}>
                    <Download className="h-3 w-3 mr-1" /> GET
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {visibleCount < filteredBooks.length && (
          <div className="flex justify-center py-8">
            <Button 
              onClick={loadMore} 
              disabled={isLoadingMore} 
              variant="outline"
              className="rounded-xl px-8 h-12 border-primary text-primary hover:bg-primary/5"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Titles...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show More (Showing {visibleCount} of {filteredBooks.length})
                </>
              )}
            </Button>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <Library className="h-16 w-16 text-muted/30 mx-auto" />
            <p className="text-muted-foreground">No books found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
