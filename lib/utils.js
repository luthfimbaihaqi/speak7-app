import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Fungsi helper untuk delay (biar loading terasa lebih natural)
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}