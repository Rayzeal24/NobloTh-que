import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatRelativeDate(value: Date | string) {
  const date = new Date(value);
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 7) {
    return new Intl.RelativeTimeFormat("fr", { numeric: "auto" }).format(days, "day");
  }
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}
