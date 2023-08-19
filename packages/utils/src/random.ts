export const getRandomItemFromArray = <T>(arr: T[]): T | undefined => {
  if (!arr.length) return undefined;
  if (arr.length === 1) return arr[0];
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const isSelected = (reference: number) => {
  return randomInt(0, 100) <= reference;
};
