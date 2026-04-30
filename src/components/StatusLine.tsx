import { nowStamp } from "@/lib/textFormatter1975";
import { useEffect, useState } from "react";

const BOOT_TIME = Date.now();

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Random-walk a fake load average (sysadmin would recognize this).
function nextLoad(prev: number) {
  const delta = (Math.random() - 0.5) * 0.15;
  return Math.max(0.05, Math.min(2.5, prev + delta));
}

export function StatusLine({ status }: { status: string }) {
  const [time, setTime] = useState(nowStamp());
  const [uptime, setUptime] = useState("00:00:00");
  const [load, setLoad] = useState<[number, number, number]>([0.42, 0.38, 0.31]);
  useEffect(() => {
    const id = setInterval(() => {
      setTime(nowStamp());
      setUptime(formatUptime(Date.now() - BOOT_TIME));
      setLoad(([a, b, c]) => [nextLoad(a), nextLoad(b), nextLoad(c)]);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const loadStr = load.map((n) => n.toFixed(2)).join(", ");
  return (
    <div className="border-t border-[var(--phosphor-dim)] mt-4 pt-2 flex flex-col sm:flex-row sm:justify-between text-xs text-[var(--phosphor-dim)] crt-text gap-1">
      <span>STATUS: {status}</span>
      <span>UP: {uptime} | LOAD: {loadStr}</span>
      <span>SYS TIME: {time}</span>
      <span>WEB-1975 v0.1</span>
    </div>
  );
}
