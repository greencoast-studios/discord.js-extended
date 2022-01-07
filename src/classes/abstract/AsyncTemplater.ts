/**
 * An abstract class that helps with the application of templates in strings that require
 * values computed asynchronously.
 * Wrap the template in curly braces inside the string you want to apply the template to.
 */
abstract class AsyncTemplater {
  /**
   * The keys handled by this async templater. They don't include the curly braces.
   * @type {string[]}
   * @memberof AsyncTemplater
   */
  public keys: string[];

  /**
   * @param keys All the keys that should be replaced inside the string.
   */
  constructor(keys: string[]) {
    this.keys = keys;
  }

  /**
   * Get the actual value that will replace the key inside the template.
   * @param key The key to replace.
   * @returns A promise that resolves to the corresponding string for the given key.
   * @throws Throws if given key does not correspond to this async templater.
   */
  public abstract get(key: string): Promise<string>;

  /**
   * Apply the template.
   * @param str The string to process.
   * @returns A promise that resolves to the string with the templates replaced.
   */
  public async apply(str: string): Promise<string> {
    return this.keys.reduce(async(curPromise, key) => {
      const cur = await curPromise;
      const regex = new RegExp(`{${key}}`, 'gi');

      if (regex.test(cur)) {
        return cur.replace(regex, await this.get(key));
      }

      return cur;
    }, Promise.resolve(str));
  }
}

export default AsyncTemplater;
