import quotesData from "./quotesData.json";

export interface Quote {
  author: string;
  quote: string;
  tags: string[];
}

export function getRandomQuote(): Quote {
  const idx = Math.floor(Math.random() * quotesData.length);
  return quotesData[idx] as Quote;
}
