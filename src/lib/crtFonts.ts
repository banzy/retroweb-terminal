export type FontId =
  | "system"
  | "courier"
  | "vt323"
  | "share-tech-mono"
  | "ibm-plex-mono"
  | "roboto-mono"
  | "space-mono"
  | "courier-prime"
  | "cutive-mono"
  | "major-mono-display"
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
  { id: "cutive-mono", label: "CUTIVE MONO", stack: `"Cutive Mono", ui-monospace, monospace` },
  { id: "major-mono-display", label: "MAJOR MONO DISPLAY", stack: `"Major Mono Display", ui-monospace, monospace` },
  { id: "nova-mono", label: "NOVA MONO", stack: `"Nova Mono", ui-monospace, monospace` },
  { id: "azeret-mono", label: "AZERET MONO", stack: `"Azeret Mono", ui-monospace, monospace` },
];

export function getFontStack(id: FontId): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).stack;
}