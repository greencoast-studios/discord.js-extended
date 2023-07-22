/**
 * The options used to create a {@link Localizer}.
 */
export interface LocalizerOptions {
  /**
   * An object that maps the name of the locale to another object that contains
   * all the available messages mapped by their keys. The messages should follow
   * a ICU standard, for more information on how to structure these messages, please visit the
   * [following link](https://formatjs.io/docs/intl-messageformat/#common-usage-example).
   *
   * The following is an example of how to structure this object:
   *
   * ```js
   * en: {
   *   'message.test.hello': 'Hello',
   *   'message.test.bye': 'Bye',
   *   'message.test.with_value': 'Hello {name}!'
   * },
   * es: {
   *   'message.test.hello': 'Hola',
   *   'message.test.bye': 'Adios',
   *   'message.test.with_value': 'Hola {name}!'
   * },
   * fr: {
   *   'message.test.hello': 'Bonjour',
   *   'message.test.bye': 'Au revoir',
   *   'message.test.with_value': 'Bonjour {name}!'
   * }
   * ```
   */
  localeStrings: Record<string, Record<string, string>>,

  /**
   * The default locale to be used in case a guild does not have its locale set in the
   * client's data provider. You should set a data provider before setting this up so
   * the guild's locale can be saved persistently.
   */
  defaultLocale: string,

  /**
   * The key used to save the value of the locale set per guild in the client's data provider
   * (if any).
   * @defaultValue `locale`
   */
  dataProviderKey?: string
}
