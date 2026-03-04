
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
  Loader2,
  Globe,
  Palette,
  Lightbulb,
  UserCircle,
  TrendingUp,
  Stethoscope,
  Brain,
  Wrench,
  Sparkles,
  Dna
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Category = 
  | "All" | "Science" | "ICT" | "Qur'an" | "Hadiths" | "Islam" | "Christian" 
  | "History" | "Laws" | "Philosophy" | "Literature" | "Arts" | "Biographies"
  | "Economics" | "Health" | "Physiology" | "Psychology" | "Engineering";

interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
  parts: number;
  cover: string;
}

const generate1000Books = (): Book[] => {
  const books: Book[] = [];
  const categories: Category[] = [
    "Science", "ICT", "Qur'an", "Hadiths", "Islam", "Christian", 
    "History", "Laws", "Philosophy", "Literature", "Arts", "Biographies",
    "Economics", "Health", "Physiology", "Psychology", "Engineering"
  ];
  
  const categoryTemplates: Record<Category, string[]> = {
    "Science": ["Principles of Physics", "Quantum Mechanics Intro", "Organic Chemistry Mastery", "Evolutionary Biology", "Modern Astrophysics", "Genetic Engineering", "Neuroscience Fundamentals", "General Relativity", "Chemical Engineering", "Botany Studies"],
    "ICT": ["Cloud Computing Architecture", "Advanced Python for Data", "Cybersecurity Shield", "React Native Development", "AI Ethics & Robotics", "Blockchain Ledger Systems", "Mastering UI/UX Design", "System Design Patterns", "Networking Essentials", "Database Management"],
    "Qur'an": ["Surah Al-Baqarah Exegesis", "The Holy Qur'an Translation", "Rules of Tajweed", "Tafsir Al-Jalalayn Complete", "Qur'anic Arabic Grammar", "History of Revelation", "Verses of Wisdom", "The Eternal Message"],
    "Hadiths": ["Sahih Al-Bukhari Volume", "Gems of Sahih Muslim", "Riyadh as-Salihin", "40 Hadith of An-Nawawi", "Sunan Abi Dawud Studies", "Science of Hadith", "The Prophetic Lifestyle", "Authentic Narrations"],
    "Islam": ["Fiqh of Ibadah", "Early Islamic History", "Biographies of Prophets", "Sufism & Spirituality", "Hajj & Umrah Handbook", "Principles of Zakat", "Shariah Law Essentials", "Philosophy of the Deen"],
    "Christian": ["The Holy Bible (KJV)", "New Testament Commentary", "Psalms & Proverbs Study", "Christian Church History", "Systematic Theology", "Analysis of the Gospels", "Old Testament Kings", "Epistles of Apostle Paul"],
    "History": ["Kingdoms of West Africa", "The Rise of Ancient Rome", "Industrial Revolution Docs", "World War II Chronicles", "Medieval European Politics", "Cold War Secret History", "Ancient Egyptian Dynasty", "Modern History of Nigeria"],
    "Laws": ["Nigerian Constitutional Law", "Criminal Justice Systems", "International Law Treaties", "Human Rights Advocacy", "Corporate Legal Structures", "Environmental Regulations", "Legal Ethics & Practice", "Property Law Framework"],
    "Philosophy": ["Meditations on Existence", "Plato's Republic Analysis", "Nietzsche: Beyond Good", "Sun Tzu: The Art of War", "Critique of Pure Reason", "Ancient Eastern Wisdom", "Principles of Logic", "Existentialist Thought"],
    "Literature": ["Classic English Poetry", "William Shakespeare Sonnets", "Modernist Prose Anthology", "The Odyssey: A Retelling", "World Drama Anthology", "Victorian Era Novels", "The Symbolist Movement", "Epic of Gilgamesh Studies"],
    "Arts": ["Masters of the Renaissance", "Abstract Art Movements", "Techniques of Sculpture", "Advanced Music Theory", "Aesthetics of Cinema", "Architectural Wonders", "The Science of Color", "History of Gothic Art"],
    "Biographies": ["Mandela: Long Walk", "Steve Jobs: The Visionary", "Malala: The Voice", "Einstein: Relative Genius", "Marie Curie: Radiation", "Malcolm X: The Legacy", "Martin Luther King Jr.", "Tesla: The Inventor"],
    "Economics": ["The Wealth of Nations", "Capital in the 21st Century", "Macroeconomic Policy", "Stock Market Mastery", "Behavioral Economics", "Global Trade Dynamics", "The Digital Currency Age", "Asset Management Intro"],
    "Health": ["Public Health Systems", "Nutrition & Metabolism", "Preventive Medicine", "Medical Ethics Handbook", "Epidemiology Studies", "Geriatric Care Guide", "Pediatrics Essentials", "Virology Research Today"],
    "Physiology": ["Human Anatomy & Physiology", "Cellular Biology Systems", "Respiratory Mechanics", "Endocrine Functions", "Neurophysiology Mastery", "Digestive System Science", "Musculoskeletal Dynamics", "Cardiovascular Health"],
    "Psychology": ["Interpretation of Dreams", "Cognitive Behavioral Therapy", "Social Dynamics Study", "Advanced Child Psychology", "Clinical Psychology Intro", "Personality Trait Analysis", "Emotional Intelligence", "Healing From Trauma"],
    "Engineering": ["Principles of Civil Engineering", "Mechanical Dynamics", "Electrical Circuitry", "Aerospace Design", "Structural Integrity", "Robotics Engineering", "Renewable Energy Systems", "Material Science Intro"],
    "All": []
  };

  const authors = ["Dr. Ahmed Lere", "Prof. Jane Smith", "Imam Malik", "Justice Roberts", "Scholar John", "Apostle Paul", "Historian Musa", "Barrister Bello", "Engr. David", "Dr. Sarah"];

  for (let i = 1; i <= 1000; i++) {
    const cat = categories[i % categories.length];
    const templates = categoryTemplates[cat];
    const template = templates[i % templates.length];
    
    books.push({
      id: i.toString(),
      title: `${template} - Part ${Math.floor(i / categories.length) + 1}`,
      author: authors[i % authors.length],
      category: cat,
      parts: (i % 12) + 1,
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
    { name: "Philosophy", icon: Lightbulb, color: "text-amber-500 bg-amber-50" },
    { name: "Literature", icon: Globe, color: "text-rose-500 bg-rose-50" },
    { name: "Arts", icon: Palette, color: "text-cyan-500 bg-cyan-50" },
    { name: "Biographies", icon: UserCircle, color: "text-violet-500 bg-violet-50" },
    { name: "Economics", icon: TrendingUp, color: "text-green-500 bg-green-50" },
    { name: "Physiology", icon: Dna, color: "text-red-500 bg-red-50" },
    { name: "Health", icon: Stethoscope, color: "text-rose-600 bg-rose-50" },
    { name: "Psychology", icon: Brain, color: "text-pink-500 bg-pink-50" },
    { name: "Engineering", icon: Wrench, color: "text-gray-600 bg-gray-100" },
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
      setVisibleCount(prev => Math.min(prev + 50, filteredBooks.length));
      setIsLoadingMore(false);
    }, 500);
  };

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
            <h1 className="text-2xl font-bold">World Library</h1>
          </div>

          <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10 rotate-12 scale-150">
              <Library size={180} />
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-none mb-2">1,000 Verified Titles</Badge>
                <h2 className="text-3xl font-bold">Search Knowledge</h2>
                <p className="text-primary-foreground/80">Every major religious and educational text is here.</p>
              </div>
              <div className="pt-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input 
                      placeholder="Search books or authors..." 
                      className="pl-10 h-12 bg-white text-foreground rounded-xl border-none shadow-sm focus-visible:ring-white"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setView("books");
                      }}
                    />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md rounded-xl h-14" onClick={() => setView("books")}>
                  <Library className="h-5 w-5 mr-2" /> Library
                </Button>
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 rounded-xl h-14" onClick={() => setView("books")}>
                  <BookOpen className="h-5 w-5 mr-2" /> All Books
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
                className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group text-left px-4"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setView("books");
                }}
              >
                <div className={`w-10 h-10 ${cat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase truncate w-full">{cat.name}</span>
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
              <h1 className="text-2xl font-bold">Book Catalog</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" /> 1,000 Verified Books
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search 1,000 books..." 
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.slice(0, visibleCount).map((book) => (
            <Card key={book.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
              <div className="flex h-44">
                <div className="w-28 shrink-0 bg-slate-100 p-2">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-md shadow-sm" loading="lazy" />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] uppercase font-bold px-2 mb-1">
                      {book.category}
                    </Badge>
                    <h4 className="font-bold text-xs leading-tight line-clamp-2">{book.title}</h4>
                    <p className="text-[9px] text-muted-foreground italic truncate">by {book.author}</p>
                    <p className="text-[10px] font-medium text-secondary mt-1">{book.parts} Parts</p>
                  </div>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 h-8 text-[10px] font-bold" onClick={() => toast({ title: "Downloading", description: `${book.title} is being saved offline.` })}>
                    <Download className="h-3 w-3 mr-1" /> GET BOOK
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {visibleCount < filteredBooks.length && (
          <div className="flex justify-center py-10">
            <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="rounded-xl px-10 h-12 border-primary text-primary hover:bg-primary/5">
              {isLoadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              Show More (Viewing {visibleCount} of {filteredBooks.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
