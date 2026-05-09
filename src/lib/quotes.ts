import quotesData from "./quotesData.json";

export interface Quote {
  id: number;
  author: string;
  quote: string;
  tags: string[];
}

const SEEN_KEY = "w1975.seenQuotes";

function loadSeen(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function getRandomQuote(): Quote {
  const all = quotesData as Quote[];
  let seen = loadSeen();

  // If we've seen them all, reset.
  if (seen.size >= all.length) {
    seen = new Set();
  }

  const unseen = all.filter((q) => !seen.has(q.id));
  const pick = unseen[Math.floor(Math.random() * unseen.length)];

  seen.add(pick.id);
  saveSeen(seen);

  return pick;
}

export function resetSeenQuotes(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    /* ignore */
  }
}
