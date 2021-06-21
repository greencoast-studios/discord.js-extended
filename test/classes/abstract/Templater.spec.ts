import Templater from '../../../src/classes/abstract/Templater';

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
    it('should return a string.', () => {
      expect(typeof templater.apply('str')).toBe('string');
    });

    it('should apply the template on all occurrences.', () => {
      const template = 'This {key} is a {key} template.';
      const expected = 'This value is a value template.';
      
      expect(templater.apply(template)).toBe(expected);
    });
  });
});
