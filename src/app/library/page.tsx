
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search, 
  Library as LibraryIcon, 
  BookOpen, 
  FlaskConical, 
  Cpu, 
  Heart, 
  Cross,
  BookMarked,
  History as HistoryIcon,
  Gavel,
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
  Dna,
  BookCopy,
  Languages,
  BookOpenCheck,
  PlusCircle,
  Users,
  GraduationCap,
  ShieldAlert,
  Landmark,
  Utensils,
  BookCheck,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateBookContent } from "@/ai/flows/generate-book-content";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Category, Book, SURA_NAMES, MASTER_LIBRARY } from "./library-data";

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  
  const [view, setView] = useState<"landing" | "books" | "quran-drill" | "surah-list" | "reader" | "my-library">("landing");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [quranType, setQuranType] = useState<string | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<{name: string, index: number} | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [quranContent, setQuranContent] = useState<any>(null);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isReaderLoading, setIsReaderLoading] = useState(false);
  const [ownedBookIds, setOwnedBookIds] = useState<string[]>([]);

  const publishedBooksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "published_books"), orderBy("createdAt", "desc"));
  }, [firestore]);
  const { data: userBooks } = useCollection(publishedBooksQuery);

  useEffect(() => {
    // Load owned books from local storage
    const saved = localStorage.getItem("my_owned_books");
    if (saved) setOwnedBookIds(JSON.parse(saved));
  }, []);

  const allBooks = useMemo(() => {
    const publishedAsBooks: Book[] = (userBooks || []).map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category as Category,
      parts: 1,
      cover: `https://picsum.photos/seed/${b.id}/200/300`,
      isPublished: true,
      price: 0
    }));
    return [...publishedAsBooks, ...MASTER_LIBRARY];
  }, [userBooks]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allBooks]);

  const ownedBooks = useMemo(() => {
    return allBooks.filter(b => ownedBookIds.includes(b.id));
  }, [allBooks, ownedBookIds]);

  useEffect(() => {
    if (view === "reader") {
      if (selectedSurah) fetchSurahContent();
      else if (selectedBook) fetchAiBookContent();
    }
  }, [view, selectedSurah, selectedBook]);

  const fetchSurahContent = async () => {
    if (!selectedSurah) return;
    setIsReaderLoading(true);
    setQuranContent(null);
    try {
      const cacheKey = `quran_${selectedSurah.index}_${quranType}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setQuranContent(JSON.parse(cached));
        setIsReaderLoading(false);
        return;
      }
      const editionMap: Record<string, string> = {
        "English Subtitles": "en.sahih",
        "Hausa Subtitles": "ha.gumi",
        "Warash": "quran-warsh-n",
        "Hafs": "quran-uthmani"
      };
      const edition = editionMap[quranType!] || "quran-uthmani";
      const [arabicRes, translationRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.index + 1}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.index + 1}/${edition}`)
      ]);
      const arabicData = await arabicRes.json();
      const translationData = await translationRes.json();
      const result = { arabic: arabicData.data, translation: translationData.data };
      setQuranContent(result);
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (err) {
      toast({ variant: "destructive", title: "API Error", description: "Failed to load Surah content." });
    } finally { setIsReaderLoading(false); }
  };

  const fetchAiBookContent = async () => {
    if (!selectedBook) return;
    setIsReaderLoading(true);
    setAiContent(null);
    try {
      const cacheKey = `book_content_${selectedBook.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAiContent(cached);
        setIsReaderLoading(false);
        return;
      }
      const content = await generateBookContent({
        title: selectedBook.title,
        author: selectedBook.author,
        category: selectedBook.category,
      });
      setAiContent(content);
      if (!content.startsWith("ERROR:") && !content.startsWith("Failed to generate content:")) {
        localStorage.setItem(cacheKey, content);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate content." });
    } finally { setIsReaderLoading(false); }
  };

  const handleDeleteOwnedBook = (id: string) => {
    const updated = ownedBookIds.filter(bid => bid !== id);
    setOwnedBookIds(updated);
    localStorage.setItem("my_owned_books", JSON.stringify(updated));
    localStorage.removeItem(`book_content_${id}`);
    toast({ title: "Removed", description: "Book removed from your library." });
  };

  const categories: { name: Category; icon: any; color: string }[] = [
    { name: "Science", icon: FlaskConical, color: "text-blue-500 bg-blue-50" },
    { name: "ICT", icon: Cpu, color: "text-indigo-500 bg-indigo-50" },
    { name: "Qur'an", icon: BookMarked, color: "text-emerald-600 bg-emerald-50" },
    { name: "Hadiths", icon: Heart, color: "text-emerald-500 bg-emerald-50" },
    { name: "Islam", icon: LibraryIcon, color: "text-teal-500 bg-teal-50" },
    { name: "Christian", icon: Cross, color: "text-purple-500 bg-purple-50" },
    { name: "History", icon: HistoryIcon, color: "text-orange-500 bg-orange-50" },
    { name: "Laws", icon: Gavel, color: "text-slate-600 bg-slate-100" },
    { name: "Philosophy", icon: Lightbulb, color: "text-amber-500 bg-amber-50" },
    { name: "Literature", icon: Globe, color: "text-rose-500 bg-rose-50" },
    { name: "Arts", icon: Palette, color: "text-cyan-500 bg-cyan-50" },
    { name: "Biographies", icon: UserCircle, color: "text-violet-500 bg-violet-50" },
    { name: "Economics", icon: TrendingUp, color: "text-green-500 bg-green-50" },
    { name: "Health", icon: Stethoscope, color: "text-rose-600 bg-rose-50" },
    { name: "Engineering", icon: Wrench, color: "text-gray-600 bg-gray-100" },
    { name: "Education", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
    { name: "Civic Education", icon: Users, color: "text-red-600 bg-red-50" },
    { name: "Cyber Security", icon: ShieldAlert, color: "text-slate-900 bg-slate-100" },
    { name: "Government", icon: Landmark, color: "text-orange-700 bg-orange-50" },
    { name: "Food & Nutrition", icon: Utensils, color: "text-yellow-600 bg-yellow-50" },
  ];

  const handleReadClick = (book: Book) => {
    if (book.price > 0 && !ownedBookIds.includes(book.id)) {
      router.push(`/library/buy/${book.id}`);
    } else {
      setSelectedBook(book);
      setView("reader");
    }
  };

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-full bg-white shadow-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">World Library</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={() => setView("my-library")}>
                <BookCheck className="h-4 w-4 mr-2" /> My Books
              </Button>
              <Button size="sm" className="rounded-full bg-emerald-600 h-10 px-4" onClick={() => router.push("/library/publish")}>
                <PlusCircle className="h-4 w-4 mr-2" /> Publish
              </Button>
            </div>
          </div>

          <Card className="bg-emerald-600 text-white border-none shadow-xl overflow-hidden relative">
            <CardContent className="p-8 space-y-4">
              <Badge className="bg-white/20 text-white border-none">AI-Powered Catalog</Badge>
              <h2 className="text-3xl font-bold">Browse Knowledge</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-emerald-600" />
                <Input 
                  placeholder="Search 1,000+ books..." 
                  className="pl-10 h-12 bg-white text-foreground rounded-xl border-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setView("books"); }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Button 
                key={cat.name} 
                variant="outline" 
                className="h-24 flex flex-col gap-2 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all group"
                onClick={() => { setSelectedCategory(cat.name); setView(cat.name === "Qur'an" ? "quran-drill" : "books"); }}
              >
                <div className={`w-10 h-10 ${cat.color} rounded-full flex items-center justify-center group-hover:scale-110`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase truncate w-full px-2">{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "my-library") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView("landing")} className="rounded-full bg-white shadow-sm"><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-2xl font-bold">My Saved Books</h1>
          </div>
          <div className="grid gap-3">
            {ownedBooks.length === 0 ? (
              <Card className="p-10 text-center bg-slate-50 border-none rounded-3xl">
                <p className="text-muted-foreground">You haven't saved any books yet.</p>
              </Card>
            ) : (
              ownedBooks.map(book => (
                <Card key={book.id} className="border-none shadow-sm bg-white overflow-hidden">
                  <div className="flex p-3 gap-3">
                    <img src={book.cover} className="w-16 h-24 object-cover rounded-md" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="bg-emerald-600 h-8 flex-1" onClick={() => handleReadClick(book)}>READ</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-red-500" onClick={() => handleDeleteOwnedBook(book.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
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
          <Button variant="ghost" onClick={() => setView("landing")} className="rounded-full bg-white shadow-sm mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Library
          </Button>
          <h1 className="text-2xl font-bold px-2">Select Recitation Style</h1>
          <div className="grid gap-4">
            {quranOptions.map(opt => (
              <Button key={opt.name} variant="outline" className="h-20 justify-between rounded-3xl bg-white border-none shadow-sm px-6" onClick={() => { setQuranType(opt.name); setView("surah-list"); }}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${opt.color} rounded-2xl flex items-center justify-center`}><opt.icon className="h-6 w-6" /></div>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView("quran-drill")} className="rounded-full bg-white shadow-sm"><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-2xl font-bold">{quranType}</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search surah..." className="pl-10 h-12 bg-white rounded-xl border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="grid gap-2 max-h-[70vh] overflow-y-auto pr-1">
            {SURA_NAMES.map((name, idx) => {
              if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) return null;
              return (
                <Card key={idx} className="border-none shadow-sm rounded-2xl cursor-pointer bg-white" onClick={() => { setSelectedSurah({name, index: idx}); setView("reader"); }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-bold text-sm">{idx + 1}. {name}</span>
                    <Button size="sm" variant="ghost" className="text-emerald-600 font-bold text-xs uppercase">READ</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === "reader") {
    const isQuran = !!selectedSurah;
    const title = isQuran ? selectedSurah.name : selectedBook?.title;
    const author = isQuran ? quranType : selectedBook?.author;

    return (
      <div className="min-h-screen bg-white p-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => { setView(isQuran ? "surah-list" : (ownedBookIds.includes(selectedBook?.id!) ? "my-library" : "books")); setSelectedSurah(null); setSelectedBook(null); setQuranContent(null); setAiContent(null); }} className="rounded-full bg-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] font-bold uppercase text-emerald-600">Knowledge Source</Badge>
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2 border-b pb-6">
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">{author}</p>
          </div>
          {isReaderLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-bold text-emerald-600">Syncing Knowledge Base...</p>
            </div>
          ) : isQuran && quranContent ? (
            <div className="space-y-12 py-8">
              {quranContent.arabic.ayahs.map((ayah: any, i: number) => (
                <div key={ayah.number} className="space-y-6 border-b pb-10">
                  <p className="text-right text-3xl leading-[3.5rem] font-medium text-slate-900" style={{ direction: 'rtl' }}>{ayah.text}</p>
                  <p className="text-slate-600 text-lg">{quranContent.translation.ayahs[i].text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-slate mt-8 text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
              {aiContent || "Generating chapters..."}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView("landing")} className="rounded-full bg-white shadow-sm"><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">{selectedCategory} Catalog</h1>
        </div>
        <div className="sticky top-4 z-40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search catalog..." className="pl-10 h-12 bg-white rounded-xl border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {filteredBooks.slice(0, visibleCount).map((book) => (
            <Card key={book.id} className="border-none shadow-sm hover:shadow-md overflow-hidden bg-white">
              <div className="flex h-44">
                <div className="w-28 bg-slate-100 p-2"><img src={book.cover} className="w-full h-full object-cover rounded-md" /></div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold">{book.category}</Badge>
                    <h4 className="font-bold text-xs line-clamp-2">{book.title}</h4>
                    <p className="text-[9px] text-muted-foreground truncate">by {book.author}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      {book.price === 0 ? "FREE" : `₦${book.price}`}
                    </p>
                  </div>
                  <Button size="sm" className="w-full bg-emerald-600 h-8 text-[10px] font-bold" onClick={() => handleReadClick(book)}>
                    <BookOpen className="h-3 w-3 mr-1" /> {book.price > 0 && !ownedBookIds.includes(book.id) ? "BUY" : "READ"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredBooks.length > visibleCount && (
            <Button variant="ghost" className="col-span-full" onClick={() => setVisibleCount(v => v + 50)}>View More</Button>
          )}
        </div>
      </div>
    </div>
  );
}
