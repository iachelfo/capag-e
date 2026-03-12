import { useState, useEffect, useCallback } from "react";

const DEMO_MODE_KEY = "__capag_demo_mode__";

/**
 * Detects whether the tRPC backend is reachable.
 * If not (e.g., static hosting), returns true to enable demo-data fallback.
 */
export function useDemoMode(): boolean {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we already know we're in demo mode
    if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_MODE_KEY) === "true") {
      setIsDemoMode(true);
      return;
    }

    // Force demo mode if env var is set
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setIsDemoMode(true);
      return;
    }

    // Probe the tRPC endpoint
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch("/api/trpc/laudo.getStats", { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Backend error");
        setIsDemoMode(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setIsDemoMode(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(DEMO_MODE_KEY, "true");
        }
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return isDemoMode;
}

/**
 * Mock query result that mimics the shape of a tRPC useQuery result
 */
export function useDemoQuery<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: useCallback(() => Promise.resolve({ data }), [data]),
  };
}
