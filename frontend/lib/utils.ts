import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function formatNumber(num: number) {
  if (num < 1000) return num.toString();
  const units = ["", "K", "M", "B", "T"];
  let unitIndex = 0;

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  return `${Math.floor(num * 10) / 10}${units[unitIndex]}`;
}

export const getFormattedTime = (date?: Date) => {
  const options = {
    day: "2-digit" as "2-digit",
    month: "2-digit" as "2-digit",
    year: "numeric" as "numeric",
    hour: "2-digit" as "2-digit",
    minute: "2-digit" as "2-digit",
    hour12: true,
  };

  if (date) {
    return date.toLocaleString("en-US", options).replace(" ", "").toLowerCase();
  }

  return new Date()
    .toLocaleString("en-US", options)
    .replace(" ", "")
    .toLowerCase();
};

