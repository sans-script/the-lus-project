"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HealthUnitLocator from "@/components/health-unit-locator";
import UserHeader from "@/components/user-header";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col">
      <UserHeader />
      <div className="flex-1 overflow-hidden">
        <HealthUnitLocator
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        />
      </div>
    </main>
  );
}
