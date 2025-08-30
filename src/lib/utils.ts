// File: src/lib/utils.ts
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Define ClassValue type locally
type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: any };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}