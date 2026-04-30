export type CrtTheme = {
  id: string;
  label: string;
  bg: string;        // CSS color
  phosphor: string;  // main text color
  bright: string;    // bright accent
  dim: string;       // dim accent
};

export const PRESET_THEMES: CrtTheme[] = [
  {
    id: "green",
    label: "P1 GREEN",
    bg: "#050b06",
    phosphor: "#33ff66",
    bright: "#9bffb0",
    dim: "#1f8a3a",
  },
  {
    id: "amber",
    label: "P3 AMBER",
    bg: "#0a0703",
    phosphor: "#ffb000",
    bright: "#ffd97a",
    dim: "#8a5e00",
  },
  {
    id: "white",
    label: "P4 WHITE",
    bg: "#020203",
    phosphor: "#e6e6e6",
    bright: "#ffffff",
    dim: "#7a7a7a",
  },
  {
    id: "blue",
    label: "IBM BLUE",
    bg: "#02030a",
    phosphor: "#4fc3ff",
    bright: "#b3e5ff",
    dim: "#1d6fa5",
  },
  {
    id: "red",
    label: "ALERT RED",
    bg: "#0a0202",
    phosphor: "#ff4444",
    bright: "#ff9999",
    dim: "#8a1c1c",
  },
];

export function applyThemeVars(t: CrtTheme): React.CSSProperties {
  return {
    // override the design tokens used by terminal components
    ["--crt-bg" as never]: t.bg,
    ["--phosphor" as never]: t.phosphor,
    ["--phosphor-bright" as never]: t.bright,
    ["--phosphor-dim" as never]: t.dim,
    ["--text-glow" as never]: `0 0 2px ${t.phosphor}, 0 0 6px ${t.phosphor}80`,
    backgroundColor: t.bg,
    color: t.phosphor,
  };
}