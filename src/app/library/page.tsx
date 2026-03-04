
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
  Dna,
  BookCopy,
  Languages,
  BookOpenCheck
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
  content?: string;
}

const SURA_NAMES = [
  "Al-Fatihah", "Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const generate1000Books = (): Book[] => {
  const books: Book[] = [];
  const categories: Category[] = [
    "Science", "ICT", "Hadiths", "Islam", "Christian", 
    "History", "Laws", "Philosophy", "Literature", "Arts", "Biographies",
    "Economics", "Health", "Physiology", "Psychology", "Engineering"
  ];
  
  const categoryTemplates: Record<Category, string[]> = {
    "Science": ["Principles of Physics", "Quantum Mechanics Intro", "Organic Chemistry Mastery", "Evolutionary Biology", "Modern Astrophysics", "Genetic Engineering", "Neuroscience Fundamentals", "General Relativity", "Chemical Engineering", "Botany Studies"],
    "ICT": ["Cloud Computing Architecture", "Advanced Python for Data", "Cybersecurity Shield", "React Native Development", "AI Ethics & Robotics", "Blockchain Ledger Systems", "Mastering UI/UX Design", "System Design Patterns", "Networking Essentials", "Database Management"],
    "Qur'an": [],
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
      cover: `https://picsum.photos/seed/book${i}/200/300`,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    });
  }
  return books;
};

const MASTER_LIBRARY = generate1000Books();

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"landing" | "books" | "quran-drill" | "surah-list" | "reader">("landing");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [quranType, setQuranType] = useState<string | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categories: { name: Category; icon: any; color: string }[] = [
    { name: "Science", icon: FlaskConical, color: "text-blue-500 bg-blue-50" },
    { name: "ICT", icon: Cpu, color: "text-indigo-500 bg-indigo-50" },
    { name: "Qur'an", icon: BookMarked, color: "text-emerald-600 bg-emerald-50" },
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

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat === "Qur'an") {
      setView("quran-drill");
    } else {
      setView("books");
    }
  };

  const openReader = (book: any) => {
    setSelectedBook(book);
    setView("reader");
  };

  const getSurahContent = (surah: string, type: string) => {
    if (type === "Hausa Subtitles") return `Tafsiri da bayani akan Suratul ${surah} a yaren Hausa don amfanin al'umma.`;
    if (type === "English Subtitles") return `Explanation and translation of Surah ${surah} in English for global readers.`;
    if (type === "Warash") return `Qira'at na Warash 'an Nafi' ga Suratul ${surah}.`;
    return `Qira'at na Hafs 'an 'Asim ga Suratul ${surah}.`;
  };

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

          <Card className="bg-emerald-600 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10 rotate-12 scale-150">
              <Library size={180} />
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-none mb-2">1,000+ Verified Titles</Badge>
                <h2 className="text-3xl font-bold">Search Knowledge</h2>
                <p className="text-white/80">Qur'an, Hadiths, ICT, and major educational texts available.</p>
              </div>
              <div className="pt-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-emerald-600" />
                    <Input 
                      placeholder="Search books or surahs..." 
                      className="pl-10 h-12 bg-white text-foreground rounded-xl border-none shadow-sm focus-visible:ring-white"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setView("books");
                      }}
                    />
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button className="bg-white text-emerald-600 hover:bg-white/90 rounded-xl h-14 font-bold" onClick={() => setView("books")}>
                  <BookOpen className="h-5 w-5 mr-2" /> Browse All Books
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
                onClick={() => handleCategorySelect(cat.name)}
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

  if (view === "quran-drill") {
    const quranOptions = [
      { name: "English Subtitles", icon: Globe, color: "text-blue-600 bg-blue-50" },
      { name: "Hausa Subtitles", icon: Languages, color: "text-red-600 bg-red-50" },
      { name: "Warash", icon: BookCopy, color: "text-purple-600 bg-purple-50" },
      { name: "Hafs", icon: BookOpenCheck, color: "text-emerald-600 bg-emerald-50" },
    ];

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView("landing")} className="rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">The Holy Qur'an</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Select your preferred recitation or translation type:</p>
          <div className="grid gap-4">
            {quranOptions.map(opt => (
              <Button 
                key={opt.name}
                variant="outline"
                className="h-20 flex items-center justify-between rounded-3xl bg-white border-none shadow-sm hover:shadow-md px-6 group"
                onClick={() => {
                  setQuranType(opt.name);
                  setView("surah-list");
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${opt.color} rounded-2xl flex items-center justify-center`}>
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <span className="font-bold">{opt.name}</span>
                </div>
                <ChevronDown className="h-5 w-5 -rotate-90 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "surah-list") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView("quran-drill")} className="rounded-full bg-white shadow-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{quranType}</h1>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">114 Surahs</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search surah name..." 
              className="pl-10 h-12 bg-white rounded-xl border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-hide pb-20">
            {SURA_NAMES.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((name, idx) => (
              <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer bg-white" onClick={() => {
                setSelectedSurah(name);
                setView("reader");
              }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-sm">{name}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-emerald-600 font-bold text-xs uppercase h-8">
                    READ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "reader") {
    const isQuran = !!selectedSurah;
    const title = isQuran ? selectedSurah : selectedBook?.title;
    const author = isQuran ? quranType : selectedBook?.author;
    const content = isQuran ? getSurahContent(selectedSurah!, quranType!) : selectedBook?.content;

    return (
      <div className="min-h-screen bg-white p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => {
            if (isQuran) {
              setView("surah-list");
              setSelectedSurah(null);
            } else {
              setView("books");
              setSelectedBook(null);
            }
          }} className="rounded-full bg-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold">A-</Button>
            <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold">A+</Button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2 border-b pb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">{author}</p>
          </div>
          <div className="prose prose-slate mt-8 text-lg leading-relaxed text-slate-700">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-emerald-600 first-letter:mr-3 first-letter:float-left">
              {content}
            </p>
            <p className="mt-4">{content}</p>
            <p className="mt-4">{content}</p>
          </div>
        </div>

        <div className="mt-auto py-6 border-t flex justify-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">End of Preview - Premium content secured</p>
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
                <CheckCircle2 className="h-3 w-3 text-primary" /> {filteredBooks.length.toLocaleString()} Titles Available
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search knowledge..." 
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
                onClick={() => handleCategorySelect(cat.name)}
              >
                <cat.icon className="h-3 w-3" /> {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {filteredBooks.slice(0, visibleCount).map((book) => (
            <Card key={book.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
              <div className="flex h-44">
                <div className="w-28 shrink-0 bg-slate-100 p-2">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-md shadow-sm" loading="lazy" />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold px-2 mb-1">
                      {book.category}
                    </Badge>
                    <h4 className="font-bold text-xs leading-tight line-clamp-2">{book.title}</h4>
                    <p className="text-[9px] text-muted-foreground italic truncate">by {book.author}</p>
                    <p className="text-[10px] font-medium text-emerald-600 mt-1">{book.parts} Parts</p>
                  </div>
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-bold" onClick={() => openReader(book)}>
                    <BookOpen className="h-3 w-3 mr-1" /> READ BOOK
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {visibleCount < filteredBooks.length && (
          <div className="flex justify-center py-10">
            <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="rounded-xl px-10 h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              {isLoadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              Show More (Viewing {visibleCount} of {filteredBooks.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
