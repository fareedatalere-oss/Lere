
export type Category = 
  | "All" | "Science" | "ICT" | "Qur'an" | "Hadiths" | "Islam" | "Christian" 
  | "History" | "Laws" | "Philosophy" | "Literature" | "Arts" | "Biographies"
  | "Economics" | "Health" | "Physiology" | "Psychology" | "Engineering"
  | "Education" | "Civic Education" | "Cyber Security" | "Government" | "Food & Nutrition";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
  parts: number;
  cover: string;
  price: number; // 0 for free
  content?: string;
  isPublished?: boolean;
}

export const SURA_NAMES = [
  "Al-Fatihah", "Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

export const generate1000Books = (): Book[] => {
  const books: Book[] = [];
  const categories: Category[] = [
    "Science", "ICT", "Hadiths", "Islam", "Christian", "History", "Laws", 
    "Philosophy", "Literature", "Arts", "Biographies", "Economics", 
    "Health", "Physiology", "Psychology", "Engineering", "Education", 
    "Civic Education", "Cyber Security", "Government", "Food & Nutrition"
  ];
  const authors = ["Dr. Ahmed Lere", "Prof. Jane Smith", "Imam Malik", "Justice Roberts", "Scholar John", "Apostle Paul", "Historian Musa", "Barrister Bello", "Engr. David", "Dr. Sarah"];
  const prices = [0, 150, 400];
  
  for (let i = 1; i <= 1000; i++) {
    const cat = categories[i % categories.length];
    books.push({
      id: `master-${i}`,
      title: `${cat} ${i % 2 === 0 ? 'Essentials' : 'Advanced Study'} Vol.${Math.floor(i/categories.length)+1}`,
      author: authors[i % authors.length],
      category: cat,
      parts: (i % 12) + 1,
      cover: `https://picsum.photos/seed/book${i}/200/300`,
      price: prices[i % prices.length],
    });
  }
  return books;
};

export const MASTER_LIBRARY = generate1000Books();
