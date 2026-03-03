
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
  pin: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, pin: string) => void;
  signup: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("lere_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = (userData: User) => {
    setUser(userData);
    localStorage.setItem("lere_user", JSON.stringify(userData));
  };

  const login = (phoneNumber: string, pin: string) => {
    const savedUser = localStorage.getItem("lere_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.phoneNumber === phoneNumber && parsed.pin === pin) {
        setUser(parsed);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lere_user");
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
