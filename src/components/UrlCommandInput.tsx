import { useState } from "react";
import { isValidUrl, normalizeUrl } from "@/lib/urlUtils";

type Props = {
  onSubmit: (url: string) => void;
  loading: boolean;
};

export function UrlCommandInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(value) || loading) return;
    onSubmit(normalizeUrl(value));
  }

  return (
    <form onSubmit={handle} className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch gap-2 border border-[var(--phosphor)] p-3 bg-[var(--crt-bg)]">
        <label className="crt-text text-[var(--phosphor)] text-sm whitespace-nowrap self-center">
          {"> LOAD WEBSITE:"}
        </label>
        <div className="flex-1 flex items-center border border-[var(--phosphor-dim)] px-2">
          <span className="text-[var(--phosphor-dim)] mr-1">[</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="flex-1 bg-transparent border-0 outline-none crt-text text-[var(--phosphor)] placeholder:text-[var(--phosphor-dim)] py-2 font-mono"
            autoFocus
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <span className="text-[var(--phosphor-dim)] ml-1">]</span>
        </div>
        <button
          type="submit"
          disabled={loading || !isValidUrl(value)}
          className="crt-text text-[var(--phosphor)] border border-[var(--phosphor)] px-4 py-2 hover:bg-[var(--phosphor)] hover:text-[var(--primary-foreground)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
        >
          [ TRANSMIT ]
        </button>
      </div>
    </form>
  );
}