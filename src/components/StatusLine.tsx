import { nowStamp } from "@/lib/textFormatter1975";
import { useEffect, useState } from "react";

export function StatusLine({ status }: { status: string }) {
  const [time, setTime] = useState(nowStamp());
  useEffect(() => {
    const id = setInterval(() => setTime(nowStamp()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="border-t border-[var(--phosphor-dim)] mt-4 pt-2 flex flex-col sm:flex-row sm:justify-between text-xs text-[var(--phosphor-dim)] crt-text gap-1">
      <span>STATUS: {status}</span>
      <span>SYS TIME: {time}</span>
      <span>WEB-1975 v0.1</span>
    </div>
  );
}
