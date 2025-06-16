import type { Log } from "@/assets/types/typelist";

export function parseLogLine(line: string): Log | null {
  const timestampMatch = line.match(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/,
  );
  if (!timestampMatch) {
    console.warn("Could not parse timestamp from line:", line);
    return null;
  }

  const timestamp = timestampMatch[1];
  const remaining = line.slice(timestamp.length).trim();

  const levelMatch = remaining.match(/^\**(INFO|ERROR|WARNING|DEBUG|TRACE)\**/);
  if (!levelMatch) {
    console.warn("Could not parse log level from line:", line);
    return null;
  }

  const type = levelMatch[1];
  const afterLevel = remaining.slice(levelMatch[0].length).trim();

  const message = afterLevel.replace(/^[^:]*:\s*/, "").trim();

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type: type.toLowerCase() as Log["type"],
    message,
    timestamp,
  };
}
