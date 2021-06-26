import * as array from '../../src/utils/array';

describe('Utils: Array', () => {
  describe('randomArrayItem()', () => {
    it('should return an item from the array.', () => {
      const arr = ['item1', 'item2'];
      for (let i = 0; i < 10; i++) {
        expect(arr).toContain(array.randomArrayItem(arr));
      }
    });
  });
});
