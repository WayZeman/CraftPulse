import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function formatNumber(n: number, locale = "uk-UA"): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return new Intl.NumberFormat(locale).format(n);
}

export function formatRelativeTime(date: Date | string, locale = "uk-UA"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diff < 60) return rtf.format(-Math.round(diff), "second");
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 2592000) return rtf.format(-Math.round(diff / 86400), "day");
  if (diff < 31536000) return rtf.format(-Math.round(diff / 2592000), "month");
  return rtf.format(-Math.round(diff / 31536000), "year");
}

export function formatUptime(percent: number): string {
  return `${percent.toFixed(2)}%`;
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function absoluteUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Parse Minecraft "§"-style color codes -> plain text + spans
export function stripMotdCodes(motd: string): string {
  return motd
    .replace(/§[0-9a-fk-or]/gi, "")
    .replace(/\\u00a7[0-9a-fk-or]/gi, "")
    .trim();
}

const MOTD_COLOR_MAP: Record<string, string> = {
  "0": "#000000", "1": "#0000aa", "2": "#00aa00", "3": "#00aaaa",
  "4": "#aa0000", "5": "#aa00aa", "6": "#ffaa00", "7": "#aaaaaa",
  "8": "#555555", "9": "#5555ff", a: "#55ff55", b: "#55ffff",
  c: "#ff5555", d: "#ff55ff", e: "#ffff55", f: "#ffffff",
  g: "#ddd605",
};

export type MotdToken = { text: string; color?: string; bold?: boolean; italic?: boolean; underline?: boolean };

export function parseMotd(motd: string): MotdToken[][] {
  if (!motd) return [];
  const lines = motd.split(/\n|\\n/);
  return lines.map((line) => parseMotdLine(line));
}

function parseMotdLine(line: string): MotdToken[] {
  const result: MotdToken[] = [];
  let current: MotdToken = { text: "" };
  const parts = line.split(/§/);
  if (parts[0]) result.push({ text: parts[0] });
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    if (!segment) continue;
    const code = segment[0]?.toLowerCase();
    const text = segment.slice(1);
    if (!code) continue;
    if (code === "r") {
      current = { text };
    } else if (code === "l") {
      current = { ...current, text, bold: true };
    } else if (code === "o") {
      current = { ...current, text, italic: true };
    } else if (code === "n") {
      current = { ...current, text, underline: true };
    } else if (MOTD_COLOR_MAP[code]) {
      current = { text, color: MOTD_COLOR_MAP[code] };
    } else {
      current = { ...current, text };
    }
    result.push(current);
  }
  return result.length ? result : [{ text: line }];
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return ip.replace(/.{4}$/, "****");
}

export function isValidHost(host: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(host)
    || /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
}
