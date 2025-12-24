import { TRANSACTION_INTERVAL } from "./constants";

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex] as T;
}

/**
 * Get a random interval for transaction generation (1-5 seconds)
 */
export function getRandomInterval(): number {
  return (
    Math.floor(
      Math.random() * (TRANSACTION_INTERVAL.MAX - TRANSACTION_INTERVAL.MIN)
    ) + TRANSACTION_INTERVAL.MIN
  );
}

/**
 * Logger utility for consistent logging
 */
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || "");
  },
  error: (message: string, error?: any) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || ""
    );
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || "");
  },
  debug: (message: string, meta?: any) => {
    if (process.env.DEBUG === "true") {
      console.log(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        meta || ""
      );
    }
  },
};
