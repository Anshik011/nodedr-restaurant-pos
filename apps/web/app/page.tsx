"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";

export default function RootPage() {
  const router = useRouter();
  const { data, isLoading, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (isSuccess && data?.user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, isSuccess, data, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
