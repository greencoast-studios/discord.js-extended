export const readFileSync = jest.fn();
export const existsSync = jest.fn(() => true);

export default {
  readFileSync,
  existsSync
};
