import type { ParsedWebsite } from "@/lib/parseWebsiteHtml";
import { asciiSeparator, nowStamp, wrapText } from "@/lib/textFormatter1975";
import { AsciiFrame } from "./AsciiFrame";
import { AsciiImage } from "./AsciiImage";
import { ASCII_TV, BANNER_NO_SIGNAL } from "@/lib/asciiBanners";

type Props = { data: ParsedWebsite; asciiWidth: number };

export function TerminalOutput({ data, asciiWidth }: Props) {
  const headerLines = [
    `TITLE: ${data.title.slice(0, 58)}`,
    `URL: ${data.url.slice(0, 58)}`,
    `RECEIVED: ${nowStamp()}`,
  ];
  const firstImage = data.images[0];
  const extraImages = data.images.slice(1, 4);

  return (
    <div className="mt-4 space-y-4">
      <AsciiFrame lines={headerLines} />

      {data.headings.length > 0 && (
        <section>
          <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm">
            {asciiSeparator("HEADINGS")}
          </pre>
          <div className="mt-2 space-y-1">
            {data.headings.map((h, i) => (
              <div
                key={i}
                className="crt-text text-[var(--phosphor)] font-mono"
                style={{
                  fontSize: h.level === 1 ? "1.1rem" : h.level === 2 ? "1rem" : "0.9rem",
                  fontWeight: h.level === 1 ? 700 : 500,
                  paddingLeft: `${(h.level - 1) * 1}rem`,
                }}
              >
                {"#".repeat(h.level)} {h.text}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.paragraphs.length > 0 && (
        <section>
          <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm">
            {asciiSeparator("CONTENT")}
          </pre>
          <div className="mt-2 space-y-3">
            {data.paragraphs.map((p, i) => (
              <pre
                key={i}
                className="ascii-pre crt-text text-[var(--phosphor)] text-sm leading-relaxed whitespace-pre-wrap"
              >
                {wrapText(p, 64)}
              </pre>
            ))}
          </div>
        </section>
      )}

      {data.links.length > 0 && (
        <section>
          <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm">
            {asciiSeparator("LINKS")}
          </pre>
          <div className="mt-2 space-y-2">
            {data.links.map((l, i) => (
              <div key={i} className="crt-text text-[var(--phosphor)] text-sm font-mono">
                <div>
                  [{(i + 1).toString().padStart(2, "0")}] {l.text.slice(0, 60)}
                </div>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--phosphor-dim)] hover:text-[var(--phosphor-bright)] underline pl-5 break-all"
                >
                  {l.href}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm">
          {asciiSeparator("IMAGE SIGNAL")}
        </pre>
        {firstImage ? (
          <div className="mt-2 space-y-6">
            <div>
              <div className="text-[var(--phosphor-dim)] text-xs crt-text mb-2 break-all">
                ASCII IMAGE [01]: {firstImage.src}
              </div>
              <AsciiImage src={firstImage.src} width={asciiWidth} />
            </div>
            {extraImages.map((img, i) => (
              <div key={i}>
                <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs">
                  {asciiSeparator(`IMAGE ${(i + 2).toString().padStart(2, "0")}`)}
                </pre>
                <div className="text-[var(--phosphor-dim)] text-xs crt-text my-2 break-all">
                  SRC: {img.src}
                </div>
                <AsciiImage src={img.src} width={asciiWidth} />
              </div>
            ))}
          </div>
        ) : (
          <pre className="ascii-pre text-[var(--phosphor-dim)] text-xs mt-2 leading-tight">
{BANNER_NO_SIGNAL}
          </pre>
        )}
      </section>

      <pre className="ascii-pre crt-text text-[var(--phosphor-dim)] text-[10px] sm:text-xs leading-tight">
{ASCII_TV}
      </pre>

      <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm">
        {asciiSeparator("END OF TRANSMISSION")}
      </pre>
    </div>
  );
}
