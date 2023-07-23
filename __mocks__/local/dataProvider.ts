import { DataProvider } from '../../src';

export class ConcreteDataProvider extends DataProvider {
  public override init(): Promise<this> {
    return Promise.resolve(this);
  }
  public override destroy(): Promise<void> {
    return Promise.resolve();
  }
  public override get(): Promise<any> {
    return Promise.resolve();
  }
  public override getGlobal(): Promise<any> {
    return Promise.resolve();
  }
  public override set(): Promise<void> {
    return Promise.resolve();
  }
  public override setGlobal(): Promise<void> {
    return Promise.resolve();
  }
  public override delete(): Promise<any> {
    return Promise.resolve();
  }
  public override deleteGlobal(): Promise<any> {
    return Promise.resolve();
  }
  public override clear(): Promise<void> {
    return Promise.resolve();
  }
  public override clearGlobal(): Promise<void> {
    return Promise.resolve();
  }
}
