/**
 * An abstract class that helps with the application of templates in strings. Wrap the template in curly braces inside the string you want to apply the template to.
 */
abstract class Templater {
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
   */
  public abstract get(key: string): string;

  /**
   * Apply the template.
   * @param str The string to process.
   * @returns The string with the templates replaced.
   */
  public apply(str: string): string {
    return this.keys.reduce((cur, key) => {
      return cur.replace(new RegExp(`{${key}}`, 'gi'), this.get(key));
    }, str);
  }
}

export default Templater;
