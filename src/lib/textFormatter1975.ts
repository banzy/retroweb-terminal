export function asciiSeparator(label: string, width = 64): string {
  const prefix = `== ${label} `;
  const fill = Math.max(3, width - prefix.length);
  return prefix + "=".repeat(fill);
}

export function asciiBox(lines: string[], width = 64): string {
  const top = "+" + "-".repeat(width - 2) + "+";
  const body = lines
    .map((l) => "| " + l.padEnd(width - 4, " ").slice(0, width - 4) + " |")
    .join("\n");
  return `${top}\n${body}\n${top}`;
}

export function wrapText(text: string, width = 62): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function nowStamp(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`;
}