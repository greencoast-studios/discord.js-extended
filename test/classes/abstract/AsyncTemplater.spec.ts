import { AsyncTemplater } from '../../../src';

class ConcreteAsyncTemplater extends AsyncTemplater {
  public get(): Promise<string> {
    return Promise.resolve('value');
  }
}

describe('Classes: Abstract: Templater', () => {
  let asyncTemplater: AsyncTemplater;

  beforeEach(() => {
    asyncTemplater = new ConcreteAsyncTemplater(['key']);
  });

  describe('apply()', () => {
    it('should resolve the same string if no templates are included.', async () => {
      const str = 'This is a regular string.';

      expect(await asyncTemplater.apply(str)).toBe(str);
    });

    it('should resolve the template on all occurrences.', async () => {
      const template = 'This {key} is a {key} template.';
      const expected = 'This value is a value template.';

      expect(await asyncTemplater.apply(template)).toBe(expected);
    });

    it('should not call get if no templates are included.', async () => {
      const str = 'This is a regular string.';
      const getSpy = jest.spyOn(asyncTemplater, 'get');

      await asyncTemplater.apply(str);

      expect(getSpy).not.toHaveBeenCalled();
    });
  });
});
