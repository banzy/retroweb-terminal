type Props = {
  asciiWidth: number;
  setAsciiWidth: (n: number) => void;
};

export function SettingsPanel({ asciiWidth, setAsciiWidth }: Props) {
  return (
    <div className="border border-[var(--phosphor-dim)] p-3 mt-3 text-xs crt-text text-[var(--phosphor-dim)] flex flex-wrap items-center gap-3">
      <span>CONFIG:</span>
      <label className="flex items-center gap-2">
        ASCII_WIDTH=
        <select
          value={asciiWidth}
          onChange={(e) => setAsciiWidth(parseInt(e.target.value, 10))}
          className="bg-[var(--crt-bg)] border border-[var(--phosphor-dim)] text-[var(--phosphor)] px-2 py-1 font-mono"
        >
          <option value={60}>60</option>
          <option value={80}>80</option>
          <option value={100}>100</option>
          <option value={120}>120</option>
        </select>
      </label>
    </div>
  );
}
