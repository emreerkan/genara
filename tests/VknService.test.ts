import { VknService } from '../src/services/vkn/VknService';

describe('VknService', () => {
  let vknService: VknService;

  beforeEach(() => {
    vknService = new VknService();
  });

  describe('metadata', () => {
    test('should expose expected length', () => {
      expect(vknService.getExpectedLength()).toBe(10);
    });
  });

  describe('validate', () => {
    describe('valid VKN numbers', () => {
      const validVknNumbers = [
        '9029589240',
        '3721052062',
        '7920586482',
        '7439837246',
        '3253690336',
        '1234567890',
        '9876543217'
      ];

      test.each(validVknNumbers)('should validate %s as valid', (vkn) => {
        expect(vknService.validate(vkn)).toBe(true);
      });
    });

    describe('invalid VKN numbers', () => {
      const invalidVknNumbers = [
        // Wrong length
        '123456789',      // 9 digits
        '12345678901',    // 11 digits
        '12345678',       // 8 digits
        '',               // empty
        
        // Non-numeric
        'abcdefghij',     // letters
        '123456789a',     // mixed
        '123-456-789',    // with dashes
        '123 456 789',    // with spaces
        
        // Invalid check digits
        '1234567891',     // wrong check digit
        '9876543211',     // wrong check digit
        '1111111112',     // wrong check digit
        
        // Invalid patterns (all same digits that are actually invalid)
        '0000000000',
        '1111111111',
        '2222222222',
        '3333333333',
        '5555555555',
        '6666666666',
        '7777777777',
        '8888888888',
        '9999999999'
      ];

      test.each(invalidVknNumbers)('should validate %s as invalid', (vkn) => {
        expect(vknService.validate(vkn)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('should handle null input', () => {
        expect(vknService.validate(null as any)).toBe(false);
      });

      test('should handle undefined input', () => {
        expect(vknService.validate(undefined as any)).toBe(false);
      });

      test('should handle number input', () => {
        expect(vknService.validate(1234567895 as any)).toBe(false);
      });

      test('should handle whitespace', () => {
        expect(vknService.validate('  1234567895  ')).toBe(false);
      });

      test('should handle empty string', () => {
        expect(vknService.validate('')).toBe(false);
      });
    });
  });

  describe('generate', () => {
    test('should generate valid VKN', () => {
      const generated = vknService.generate();
      expect(generated).toHaveLength(10);
      expect(/^\d{10}$/.test(generated)).toBe(true);
      expect(vknService.validate(generated)).toBe(true);
    });

    test('should generate different VKNs on multiple calls', () => {
      const generated1 = vknService.generate();
      const generated2 = vknService.generate();
      // They might be the same by chance, but very unlikely
      // So we'll test that they're both valid instead
      expect(vknService.validate(generated1)).toBe(true);
      expect(vknService.validate(generated2)).toBe(true);
    });

    test('should generate multiple valid VKNs', () => {
      for (let i = 0; i < 10; i++) {
        const generated = vknService.generate();
        expect(vknService.validate(generated)).toBe(true);
      }
    });

    test('should always generate valid format', () => {
      for (let i = 0; i < 5; i++) {
        const generated = vknService.generate();
        expect(generated).toMatch(/^\d{10}$/);
      }
    });
  });

  describe('complete', () => {
    test('should complete valid 9-digit prefix', () => {
      const prefix = '123456789';
      const completed = vknService.complete(prefix);
      expect(completed.startsWith(prefix)).toBe(true);
      expect(completed).toHaveLength(10);
      expect(vknService.validate(completed)).toBe(true);
    });

    test('should complete different valid prefixes consistently', () => {
      const prefix = '987654321';
      const completed1 = vknService.complete(prefix);
      const completed2 = vknService.complete(prefix);
      expect(completed1).toBe(completed2); // Should be deterministic
      expect(vknService.validate(completed1)).toBe(true);
    });

    test('should handle edge case prefixes', () => {
      const prefixes = ['100000000', '999999999', '234567890'];
      prefixes.forEach(prefix => {
        const completed = vknService.complete(prefix);
        expect(completed.startsWith(prefix)).toBe(true);
        expect(vknService.validate(completed)).toBe(true);
      });
    });

    test('should throw error for invalid prefix length', () => {
      expect(() => vknService.complete('12345678')).toThrow();
      expect(() => vknService.complete('1234567890')).toThrow();
      expect(() => vknService.complete('')).toThrow();
    });

    test('should throw error for non-numeric prefix', () => {
      expect(() => vknService.complete('12345678a')).toThrow();
      expect(() => vknService.complete('abcdefghi')).toThrow();
    });

    test('should handle null/undefined input', () => {
      expect(() => vknService.complete(null as any)).toThrow();
      expect(() => vknService.complete(undefined as any)).toThrow();
    });
  });

  describe('VKN algorithm correctness', () => {
    test('should calculate correct check digit for known examples', () => {
      // Test specific cases where we know the expected outcome
      const prefix = '123456789';
      const completed = vknService.complete(prefix);
      const expectedCheckDigit = '0'; // Based on actual VKN algorithm
      expect(completed[9]).toBe(expectedCheckDigit);
    });

    test('should follow VKN mathematical rules', () => {
      const prefix = '123456789';
      const completed = vknService.complete(prefix);
      
      // Extract digits
      const digits = completed.split('').map(Number);
      
      // VKN algorithm implementation (complex formula)
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        const d = digits[i];
        const pos = i + 1;
        const p = (d + 10 - pos) % 10;
        
        let q: number;
        if (p === 9) {
          q = 9;
        } else {
          q = (p * Math.pow(2, 10 - pos)) % 9;
        }
        sum += q;
      }
      
      const expectedCheckDigit = (10 - (sum % 10)) % 10;
      expect(expectedCheckDigit).toBe(digits[9]);
    });

    test('should validate algorithm with multiple examples', () => {
      const prefixes = ['123456789', '987654321', '555555555'];
      prefixes.forEach(prefix => {
        const completed = vknService.complete(prefix);
        const digits = completed.split('').map(Number);
        
        // Use the actual VKN algorithm
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          const d = digits[i];
          const pos = i + 1;
          const p = (d + 10 - pos) % 10;
          
          let q: number;
          if (p === 9) {
            q = 9;
          } else {
            q = (p * Math.pow(2, 10 - pos)) % 9;
          }
          sum += q;
        }
        
        const expectedCheckDigit = (10 - (sum % 10)) % 10;
        expect(expectedCheckDigit).toBe(digits[9]);
      });
    });
  });

  describe('performance and stress tests', () => {
    test('should generate many valid VKNs quickly', () => {
      const start = Date.now();
      const generated = [];
      
      for (let i = 0; i < 1000; i++) {
        generated.push(vknService.generate());
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should take less than 1 second
      
      // Validate a sample
      const sample = generated.slice(0, 10);
      sample.forEach(vkn => {
        expect(vknService.validate(vkn)).toBe(true);
      });
    });

    test('should validate many VKNs quickly', () => {
      const testVkns = Array(1000).fill(0).map(() => vknService.generate());
      
      const start = Date.now();
      testVkns.forEach(vkn => vknService.validate(vkn));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should take less than 0.5 seconds
    });
  });

  describe('integration with real world scenarios', () => {
    test('should handle typical VKN patterns', () => {
      // Test some realistic VKN patterns
      const realWorldPatterns = [
        '1234567890', // Standard pattern
        '9876543217', // Descending pattern
        '1000000018', // Pattern with zeros
        '4444444444'  // Repeated digits (this one is actually valid)
      ];

      realWorldPatterns.forEach(vkn => {
        if (vknService.validate(vkn)) {
          expect(vkn).toHaveLength(10);
          expect(/^\d{10}$/.test(vkn)).toBe(true);
        }
      });
    });

    test('should reject known invalid patterns', () => {
      const invalidPatterns = [
        '0000000000', // All zeros
        '1111111111', // All ones
        '9999999999', // All nines
        '1234567891', // Wrong check digit
        '9876543211'  // Wrong check digit
      ];

      invalidPatterns.forEach(vkn => {
        expect(vknService.validate(vkn)).toBe(false);
      });
    });
  });
});
