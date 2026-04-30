import { asciiBox } from "@/lib/textFormatter1975";

export function AsciiFrame({ lines, width = 64 }: { lines: string[]; width?: number }) {
  return (
    <pre className="ascii-pre crt-text text-[var(--phosphor)] text-xs sm:text-sm leading-tight">
      {asciiBox(lines, width)}
    </pre>
  );
}