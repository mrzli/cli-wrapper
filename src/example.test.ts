import { describe, expect, it } from '@jest/globals';
import { someFunction } from './example';

describe('example', () => {
  describe('someFunction()', () => {
    it('should return a greeting', () => {
      expect(someFunction()).toBe('Hello World!');
    });
  });
});
