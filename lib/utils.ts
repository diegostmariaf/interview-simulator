import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge Tailwind classes safely (handles conflicts like "p-2 p-4")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
