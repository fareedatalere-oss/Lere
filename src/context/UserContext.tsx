
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFirebase } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface User {
  id?: string;
  username: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
  pin: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, pin: string) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with Firestore profile
        const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const signup = async (userData: User) => {
    try {
      // Use phone number as a dummy email for Firebase Auth
      const email = `${userData.phoneNumber}@lereconnect.com`;
      const password = `pin_${userData.pin}_safe`; // Use PIN in password
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const fullUser = { ...userData, id: uid };
      
      // Save to Firestore
      await setDoc(doc(firestore, "users", uid), fullUser);
      setUser(fullUser);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (phoneNumber: string, pin: string) => {
    try {
      const email = `${phoneNumber}@lereconnect.com`;
      const password = `pin_${pin}_safe`;
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
