import { useEffect, useRef, useState } from "react";

/**
 * useState that persists to localStorage. Reads synchronously on the client
 * so the first paint can use stored visual preferences like the cabinet frame.
 */
export function useLocalStorageState<T>(key: string, initial: T) {
  const hydrated = useRef(typeof window !== "undefined");
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Re-read if the storage key itself changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw !== null ? (JSON.parse(raw) as T) : initial);
    } catch {
      setValue(initial);
    }
    hydrated.current = true;
  }, [key]);

  // Persist after the initial client read.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
