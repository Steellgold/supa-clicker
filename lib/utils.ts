import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

  const suffixes = [
    { value: 1e63, suffix: "V" },      // Vigintillion
    { value: 1e60, suffix: "N" },      // Novemdecillion  
    { value: 1e57, suffix: "OD" },     // Octodecillion
    { value: 1e54, suffix: "SD" },     // Septendecillion
    { value: 1e51, suffix: "SxD" },    // Sexdecillion
    { value: 1e48, suffix: "QD" },     // Quindecillion
    { value: 1e45, suffix: "QaD" },    // Quattuordecillion
    { value: 1e42, suffix: "TD" },     // Tredecillion
    { value: 1e39, suffix: "DD" },     // Duodecillion
    { value: 1e36, suffix: "U" },      // Undecillion
    { value: 1e33, suffix: "D" },      // Decillion
    { value: 1e30, suffix: "No" },     // Nonillion
    { value: 1e27, suffix: "O" },      // Octillion
    { value: 1e24, suffix: "Sp" },     // Septillion
    { value: 1e21, suffix: "Sx" },     // Sextillion
    { value: 1e18, suffix: "Qi" },     // Quintillion
    { value: 1e15, suffix: "Qa" },     // Quadrillion
    { value: 1e12, suffix: "T" },      // Trillion
    { value: 1e9, suffix: "B" },       // Billion
    { value: 1e6, suffix: "M" },       // Million
    { value: 1e3, suffix: "K" }        // Thousand
  ];

  for (const { value, suffix } of suffixes) {
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