import { resolveUrl } from "./urlUtils";

export type ParsedWebsite = {
  title: string;
  url: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  links: { text: string; href: string }[];
  images: { src: string; alt?: string }[];
};

const STRIP_TAGS = ["script", "style", "noscript", "svg", "iframe", "nav", "footer", "header", "aside", "form"];

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&[a-z]+;/gi, " ");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

function clean(text: string): string {
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

export function parseWebsiteHtml(html: string, baseUrl: string): ParsedWebsite {
  let cleaned = html;
  for (const tag of STRIP_TAGS) {
    const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi");
    cleaned = cleaned.replace(re, " ");
    cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), " ");
  }
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, " ");

  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? clean(titleMatch[1]) : "UNTITLED DOCUMENT";

  const headings: ParsedWebsite["headings"] = [];
  const headingRe = /<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(cleaned)) && headings.length < 20) {
    const text = clean(stripTags(m[2]));
    if (text) headings.push({ level: parseInt(m[1][1], 10), text });
  }

  const paragraphs: string[] = [];
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const seen = new Set<string>();
  while ((m = pRe.exec(cleaned)) && paragraphs.length < 40) {
    const text = clean(stripTags(m[1]));
    if (text.length >= 30 && !seen.has(text)) {
      seen.add(text);
      paragraphs.push(text);
    }
  }

  const links: ParsedWebsite["links"] = [];
  const aRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seenLinks = new Set<string>();
  while ((m = aRe.exec(cleaned)) && links.length < 30) {
    const href = resolveUrl(m[1], baseUrl);
    const text = clean(stripTags(m[2])) || href;
    if (!/^(javascript:|mailto:|#)/i.test(m[1]) && !seenLinks.has(href) && text.length < 200) {
      seenLinks.add(href);
      links.push({ text, href });
    }
  }

  const images: ParsedWebsite["images"] = [];
  const imgRe = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi;
  while ((m = imgRe.exec(cleaned)) && images.length < 5) {
    const src = resolveUrl(m[1], baseUrl);
    const altMatch = m[0].match(/alt=["']([^"']*)["']/i);
    if (!/^data:/i.test(m[1])) {
      images.push({ src, alt: altMatch?.[1] });
    }
  }

  return { title, url: baseUrl, headings, paragraphs, links, images };
}