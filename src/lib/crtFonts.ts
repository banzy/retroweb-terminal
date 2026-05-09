export type FontId =
  | "system"
  | "courier"
  | "vt323"
  | "share-tech-mono"
  | "ibm-plex-mono"
  | "roboto-mono"
  | "space-mono"
  | "courier-prime"
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
  { id: "vt323", label: "VT323", stack: `"VT323", ui-monospace, monospace` },
  { id: "share-tech-mono", label: "SHARE TECH MONO", stack: `"Share Tech Mono", ui-monospace, monospace` },
  { id: "ibm-plex-mono", label: "IBM PLEX MONO", stack: `"IBM Plex Mono", ui-monospace, monospace` },
  { id: "roboto-mono", label: "ROBOTO MONO", stack: `"Roboto Mono", ui-monospace, monospace` },
  { id: "space-mono", label: "SPACE MONO", stack: `"Space Mono", ui-monospace, monospace` },
  { id: "courier-prime", label: "COURIER PRIME", stack: `"Courier Prime", "Courier New", monospace` },
  { id: "nova-mono", label: "NOVA MONO", stack: `"Nova Mono", ui-monospace, monospace` },
  { id: "azeret-mono", label: "AZERET MONO", stack: `"Azeret Mono", ui-monospace, monospace` },
];

export function getFontStack(id: FontId): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).stack;
}

export function getFontScale(id: FontId): number {
  return id === "vt323" ? 1.2 : 1;
}

export function getFontCssVars(id: FontId): Record<string, string> {
  const scale = getFontScale(id);
  return {
    "--terminal-font": getFontStack(id),
    "--text-xs": `${0.75 * scale}rem`,
    "--text-sm": `${0.875 * scale}rem`,
    "--text-base": `${scale}rem`,
  };
}