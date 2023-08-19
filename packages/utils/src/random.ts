export const getRandomItemFromArray = <T>(arr: T[]): T => {
  if (!arr.length) throw new Error("Array is empty");
  if (arr.length === 1) return arr[0]!;
  return arr[Math.floor(Math.random() * arr.length)]!;
};
