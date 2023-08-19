export const getRandomItemFromArray = <T>(arr: T[]): T | undefined => {
  if (!arr.length) return undefined;
  if (arr.length === 1) return arr[0];
  return arr[Math.floor(Math.random() * arr.length)];
};
