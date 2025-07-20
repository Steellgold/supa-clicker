import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatWithSpaces = (num: number) => {
  return Math.floor(num).toLocaleString('fr-FR').replace(/,/g, ' ');
}

export const formatNumber = (num: number) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num).toString();
};

export const formatDecimal = (num: number, digits: number = 1): string | number => {
  if (num % 1 === 0) return num;
  return Number(num.toFixed(digits)).toString();
};