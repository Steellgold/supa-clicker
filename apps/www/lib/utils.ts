import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { numberSuffixes } from "./number-suffixes";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatWithSpaces = (num: number) => {
  return Math.floor(num).toLocaleString("en-US").replace(/,/g, " ");
}

export const formatNumber = (num: number): string => {
  // Handle very small or invalid numbers
  if (!isFinite(num) || isNaN(num) || num < 0) return "0";
  if (num < 1e3) return Math.floor(num).toString();
  if (num < 1e6) return Math.floor(num).toLocaleString("en-US").replace(/,/g, " ");

  for (const { value, suffix } of numberSuffixes) {
    if (num >= value) {
      const formattedNum = num / value;
      if (formattedNum >= 1000) {
        return parseFloat(formattedNum.toFixed(0)).toString() + suffix;
      } else if (formattedNum >= 100) {
        return parseFloat(formattedNum.toFixed(1)).toString() + suffix;
      } else if (formattedNum >= 10) {
        return parseFloat(formattedNum.toFixed(2)).toString() + suffix;
      } else {
        return parseFloat(formattedNum.toFixed(2)).toString() + suffix;
      }
    }
  }

  // Fallback for extremely large numbers
  if (num >= 1e66) {
    return num.toExponential(2);
  }

  return Math.floor(num).toString();
};

export const formatDecimal = (num: number, digits: number = 1): string | number => {
  if (num % 1 === 0) return num;
  return Number(num.toFixed(digits)).toString();
};

export const formatWithSpacesAndSuffix = (num: number) => {
  if (!isFinite(num) || isNaN(num) || num < 0) return "0";
  if (num < 1e9) {
    return Math.floor(num).toLocaleString("fr-FR").replace(/,/g, " ");
  }
  for (const { value, suffix } of numberSuffixes) {
    if (num >= value) {
      const main = Math.floor(num / value).toString();
      const main6 = main.slice(0, 6);
      let formatted = main6;
      if (main6.length > 3) {
        formatted = main6.slice(0, main6.length - 3) + " " + main6.slice(main6.length - 3);
      }
      return `${formatted} ${suffix}`;
    }
  }
  return Math.floor(num).toLocaleString("fr-FR").replace(/,/g, " ");
};

export const formatCookieClickerNumber = (num: number) => {
  if (!isFinite(num) || isNaN(num) || num < 0) return "0";
  if (num < 1e6) {
    return Math.floor(num).toLocaleString("fr-FR").replace(/,/g, " ");
  }
  for (const { value, suffix } of numberSuffixes) {
    if (num >= value) {
      const main = num / value;
      const formatted = main.toFixed(3);
      return `${formatted} ${suffix}`;
    }
  }
  return Math.floor(num).toLocaleString("fr-FR").replace(/,/g, " ");
};