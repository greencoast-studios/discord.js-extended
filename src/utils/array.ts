/**
 * Return a random item contained in the given array.
 * @param arr The array from where to get the random item.
 * @returns The randomly picked item from the given array.
 */
export const randomArrayItem = <T>(arr: T[]): T => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};
