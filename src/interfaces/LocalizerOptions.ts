interface LocalizerOptions {
  localeStrings: Record<string, Record<string, string>>,
  defaultLocale: string,
  dataProviderKey?: string
}

export default LocalizerOptions;
