import { useEffect, useRef, useState } from "react";

/**
 * useState that persists to localStorage. SSR-safe: reads the stored value
 * lazily inside an effect on the client, so hydration matches the server.
 */
export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  // Read stored value once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt values */
    }
    hydrated.current = true;
  }, [key]);

  // Persist after the initial client read.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}