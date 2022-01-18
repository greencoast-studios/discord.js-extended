class RedisMock {
  public connect: jest.Mock;
  public quit: jest.Mock;
  public on: jest.Mock;

  public _data: Map<string, string>;

  constructor() {
    this.connect = jest.fn(() => Promise.resolve());
    this.quit = jest.fn(() => Promise.resolve());
    this.on = jest.fn();

    this._data = new Map();
  }

  public async get(key: string): Promise<string | null> {
    return this._data.get(key) || null;
  }

  public exists(key: string): Promise<boolean> {
    return Promise.resolve(this._data.has(key));
  }

  public set(key: string, value: string): Promise<void> {
    this._data.set(key, value);
    return Promise.resolve();
  }

  public async getDel(key: string): Promise<string | null> {
    if (await this.exists(key)) {
      const val = await this.get(key);
      this._data.delete(key);
      return val;
    }

    return null;
  }

  public async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      for (const k of key) {
        if (await this.exists(k)) {
          this._data.delete(k);
        }
      }
      return;
    }

    if (await this.exists(key)) {
      this._data.delete(key);
    }
  }

  public keys(pattern: string): Promise<string[]> {
    const starts = pattern.endsWith('*') ? pattern.slice(0, pattern.length - 1) : pattern;
    return Promise.resolve(Array.from(this._data.keys()).filter((k) => k.startsWith(starts)));
  }

  public static createClient(): RedisMock {
    return new RedisMock();
  }
}

export default RedisMock;
