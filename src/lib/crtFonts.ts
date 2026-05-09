export type FontId =
  | "system"
  | "courier"
  | "share-tech-mono"
  | "ibm-plex-mono"
  | "space-mono"
  | "nova-mono"
  | "azeret-mono";

export type CrtFont = {
  id: FontId;
  label: string;
  stack: string;
};

export const FONTS: CrtFont[] = [
  {
    id: "system",
    label: "SYSTEM MONO",
    stack: `ui-monospace, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  },
  { id: "courier", label: "COURIER NEW", stack: `"Courier New", Courier, monospace` },
  { id: "share-tech-mono", label: "SHARE TECH MONO", stack: `"Share Tech Mono", ui-monospace, monospace` },
  { id: "ibm-plex-mono", label: "IBM PLEX MONO", stack: `"IBM Plex Mono", ui-monospace, monospace` },
  { id: "space-mono", label: "SPACE MONO", stack: `"Space Mono", ui-monospace, monospace` },
  { id: "nova-mono", label: "NOVA MONO", stack: `"Nova Mono", ui-monospace, monospace` },
  { id: "azeret-mono", label: "AZERET MONO", stack: `"Azeret Mono", ui-monospace, monospace` },
];

export function getFontStack(id: FontId): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).stack;
}

export function getFontCssVars(id: FontId): Record<string, string> {
  return { "--terminal-font": getFontStack(id) };
}