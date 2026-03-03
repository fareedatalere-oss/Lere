
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProvider, useUser } from "@/context/UserContext";

function HomeContent() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-primary font-bold text-2xl">Lere Connect...</div>
    </div>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <HomeContent />
    </UserProvider>
  );
}
