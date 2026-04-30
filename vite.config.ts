import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/** Production asset + router prefix when the app is not at the domain root (e.g. /retroweb/). Override with VITE_DEPLOY_BASE=/ for root hosting. */
function deployBasePath(): string {
  const raw = process.env.VITE_DEPLOY_BASE;
  if (raw !== undefined) {
    if (raw === "" || raw === "/") return "/";
    return raw.endsWith("/") ? raw : `${raw}/`;
  }
  return "/retroweb/";
}

export default defineConfig(({ command }) => ({
  base: command === "build" ? deployBasePath() : "/",
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss(), tsconfigPaths()],
}));
