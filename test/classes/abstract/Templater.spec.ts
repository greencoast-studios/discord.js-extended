import { Templater } from '../../../src';

class ConcreteTemplater extends Templater {
  public get(): string {
    return 'value';
  }
}

describe('Classes: Abstract: Templater', () => {
  let templater: Templater;

  beforeEach(() => {
    templater = new ConcreteTemplater(['key']);
  });

  describe('apply()', () => {
    it('should return the same string if no templates are included.', () => {
      const str = 'This is a regular string.';

      expect(templater.apply(str)).toBe(str);
    });

    it('should apply the template on all occurrences.', () => {
      const template = 'This {key} is a {key} template.';
      const expected = 'This value is a value template.';

      expect(templater.apply(template)).toBe(expected);
    });

    it('should not call get if no templates are included.', () => {
      const str = 'This is a regular string.';
      const getSpy = jest.spyOn(templater, 'get');

      templater.apply(str);

      expect(getSpy).not.toHaveBeenCalled();
    });
  });
});
