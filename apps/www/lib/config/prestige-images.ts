/**
 * Configuration des images de prestige par tranches
 */

export const PRESTIGE_IMAGES = {
  0: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRceqv0upBMiApDtJcY4WN9wVo8uvlQTZ7FkEXn",
  1: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcUbkjnNyPsVRcIu2TzK5kp4YXWB0hm1fUFxLe",
  2: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcmlN6S9sWL7f89CqRQmsKP2zbXUZJcHogvarN",
  3: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcA0bxBAwoaBIV7sGyS1uTJNWd0MZHYPF6ADrw",
  4: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRc4VW7Yiu0xlLfaWjMq9XH1CPAw6DozbUBI5T2",
  5: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcZKCNu8JMGwqBKm0v6Q14pdzuhLc2ilNfkgjt"
} as const;

export const getPrestigeImageUrl = (level: number): string => {
  if (level === 0) return PRESTIGE_IMAGES[0];
  if (level >= 1 && level <= 10) return PRESTIGE_IMAGES[1];
  if (level >= 11 && level <= 20) return PRESTIGE_IMAGES[2];
  if (level >= 21 && level <= 30) return PRESTIGE_IMAGES[3];
  if (level >= 31 && level <= 40) return PRESTIGE_IMAGES[4];
  if (level >= 41 && level <= 50) return PRESTIGE_IMAGES[5];
  return PRESTIGE_IMAGES[0];
};