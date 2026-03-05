
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFirebase } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  limit 
} from "firebase/firestore";

interface User {
  id?: string;
  username: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
  rewardBalance: number;
  pin: string;
  createdAt?: string;
  myReferralCode?: string;
  faceLoginActive?: boolean;
  voiceLoginActive?: boolean;
  faceData?: string | null;
  voiceData?: string | null;
  customRingtoneUrl?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, pin: string) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  addReward: (amount: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const sanitizePhoneNumberForEmail = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  const signup = async (userData: User) => {
    try {
      const safePhone = sanitizePhoneNumberForEmail(userData.phoneNumber);
      if (!safePhone) throw new Error("Invalid phone number");

      const phoneQuery = query(collection(firestore, "users"), where("phoneNumber", "==", userData.phoneNumber), limit(1));
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        throw new Error("This phone number is already registered.");
      }

      const email = `${safePhone}@lereconnect.com`;
      const password = `pin_${userData.pin}_safe`; 
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const fullUser = { 
        ...userData, 
        id: uid,
        balance: 0.00,
        rewardBalance: 0.00,
        createdAt: new Date().toISOString(),
        myReferralCode: "LERE" + Math.floor(1000 + Math.random() * 9000),
        faceLoginActive: false,
        voiceLoginActive: false
      };
      
      await setDoc(doc(firestore, "users", uid), fullUser);
      setUser(fullUser);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (phoneNumber: string, pin: string) => {
    try {
      const safePhone = sanitizePhoneNumberForEmail(phoneNumber);
      if (!safePhone) throw new Error("Invalid phone number");

      const email = `${safePhone}@lereconnect.com`;
      const password = `pin_${pin}_safe`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addReward = async (amount: number) => {
    if (!user?.id || !firestore) return;
    const newReward = (user.rewardBalance || 0) + amount;
    const userRef = doc(firestore, "users", user.id);
    await setDoc(userRef, { rewardBalance: newReward }, { merge: true });
    setUser({ ...user, rewardBalance: newReward });
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, logout, addReward }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
