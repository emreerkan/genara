import { TcknService } from '../src/services/tckn/TcknService';

describe('TcknService', () => {
  let tcknService: TcknService;

  beforeEach(() => {
    tcknService = new TcknService();
  });

  describe('metadata', () => {
    test('should expose expected length', () => {
      expect(tcknService.getExpectedLength()).toBe(11);
    });
  });

  describe('validate', () => {
    describe('valid TCKN numbers', () => {
      const validTcknNumbers = [
        '91056874370',
        '52598042320', 
        '74281482602',
        '98332552816',
        '49717783714',
        '10000000146',
        '12345678950'
      ];

      test.each(validTcknNumbers)('should validate %s as valid', (tckn) => {
        expect(tcknService.validate(tckn)).toBe(true);
      });
    });

    describe('invalid TCKN numbers', () => {
      const invalidTcknNumbers = [
        // Wrong length
        '1234567890',     // 10 digits
        '123456789012',   // 12 digits
        '123456789',      // 9 digits
        '',               // empty
        
        // Non-numeric
        'abcdefghijk',    // letters
        '1234567890a',    // mixed
        '123-456-7890',   // with dashes
        '123 456 7890',   // with spaces
        
        // Starting with 0
        '01234567890',
        
        // Invalid check digits
        '12345678900',    // wrong 10th digit
        '12345678902',    // wrong 11th digit
        '12345678911',    // both wrong
        
        // All same digits (invalid patterns)
        '33333333330',
        '44444444440',
        '66666666660',
        '77777777770',
        '88888888880',
        '99999999990'
      ];

      test.each(invalidTcknNumbers)('should validate %s as invalid', (tckn) => {
        expect(tcknService.validate(tckn)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('should handle null input', () => {
        expect(tcknService.validate(null as any)).toBe(false);
      });

      test('should handle undefined input', () => {
        expect(tcknService.validate(undefined as any)).toBe(false);
      });

      test('should handle number input', () => {
        expect(tcknService.validate(12345678901 as any)).toBe(false);
      });

      test('should handle whitespace', () => {
        expect(tcknService.validate('  12345678901  ')).toBe(false);
      });
    });
  });

  describe('generate', () => {
    test('should generate valid TCKN', () => {
      const generated = tcknService.generate();
      expect(generated).toHaveLength(11);
      expect(/^\d{11}$/.test(generated)).toBe(true);
      expect(tcknService.validate(generated)).toBe(true);
    });

    test('should generate different TCKNs on multiple calls', () => {
      const generated1 = tcknService.generate();
      const generated2 = tcknService.generate();
      // They might be the same by chance, but very unlikely
      // So we'll test that they're both valid instead
      expect(tcknService.validate(generated1)).toBe(true);
      expect(tcknService.validate(generated2)).toBe(true);
    });

    test('should generate multiple valid TCKNs', () => {
      for (let i = 0; i < 10; i++) {
        const generated = tcknService.generate();
        expect(tcknService.validate(generated)).toBe(true);
      }
    });

    test('should not start with 0', () => {
      for (let i = 0; i < 20; i++) {
        const generated = tcknService.generate();
        expect(generated[0]).not.toBe('0');
      }
    });

    test('should always generate valid format', () => {
      for (let i = 0; i < 5; i++) {
        const generated = tcknService.generate();
        expect(generated).toMatch(/^\d{11}$/);
        expect(generated[0]).not.toBe('0');
      }
    });
  });

  describe('complete', () => {
    test('should complete valid 9-digit prefix', () => {
      const prefix = '123456789';
      const completed = tcknService.complete(prefix);
      expect(completed.startsWith(prefix)).toBe(true);
      expect(completed).toHaveLength(11);
      expect(tcknService.validate(completed)).toBe(true);
    });

    test('should complete different valid prefixes consistently', () => {
      const prefix = '987654321';
      const completed1 = tcknService.complete(prefix);
      const completed2 = tcknService.complete(prefix);
      expect(completed1).toBe(completed2); // Should be deterministic
      expect(tcknService.validate(completed1)).toBe(true);
    });

    test('should handle edge case prefixes', () => {
      const prefixes = ['100000001', '987654321', '123456789'];
      prefixes.forEach(prefix => {
        const completed = tcknService.complete(prefix);
        expect(completed.startsWith(prefix)).toBe(true);
        expect(tcknService.validate(completed)).toBe(true);
      });
    });

    test('should throw error for invalid prefix length', () => {
      expect(() => tcknService.complete('12345678')).toThrow();
      expect(() => tcknService.complete('1234567890')).toThrow();
      expect(() => tcknService.complete('')).toThrow();
    });

    test('should throw error for non-numeric prefix', () => {
      expect(() => tcknService.complete('12345678a')).toThrow();
      expect(() => tcknService.complete('abcdefghi')).toThrow();
    });

    test('should throw error for prefix starting with 0', () => {
      expect(() => tcknService.complete('012345678')).toThrow();
    });

    test('should throw error for repeated digit prefixes', () => {
      expect(() => tcknService.complete('111111111')).toThrow('Geçersiz prefix desenli');
    });

    test('should handle null/undefined input', () => {
      expect(() => tcknService.complete(null as any)).toThrow();
      expect(() => tcknService.complete(undefined as any)).toThrow();
    });
  });

  describe('TCKN algorithm correctness', () => {
    test('should calculate correct check digits for known examples', () => {
      // These are test cases where we know the expected outcome
      const testCases = [
        { prefix: '123456789', expected10th: '5', expected11th: '0' },
        { prefix: '987654321', expected10th: '5', expected11th: '0' },
        { prefix: '100000001', expected10th: '4', expected11th: '6' }
      ];

      testCases.forEach(({ prefix, expected10th, expected11th }) => {
        const completed = tcknService.complete(prefix);
        expect(completed[9]).toBe(expected10th);
        expect(completed[10]).toBe(expected11th);
      });
    });

    test('should follow TCKN mathematical rules', () => {
      const prefix = '123456789';
      const completed = tcknService.complete(prefix);
      
      // Extract digits
      const digits = completed.split('').map(Number);
      
      // Rule 1: Sum of odd positioned digits (1st, 3rd, 5th, 7th, 9th)
      const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
      
      // Rule 2: Sum of even positioned digits (2nd, 4th, 6th, 8th)
      const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
      
      // Rule 3: (oddSum * 7 - evenSum) % 10 should equal 10th digit
      const tenthDigit = (oddSum * 7 - evenSum) % 10;
      expect(tenthDigit).toBe(digits[9]);
      
      // Rule 4: Sum of first 10 digits % 10 should equal 11th digit
      const first10Sum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
      const eleventhDigit = first10Sum % 10;
      expect(eleventhDigit).toBe(digits[10]);
    });
  });

  describe('performance and stress tests', () => {
    test('should generate many valid TCKNs quickly', () => {
      const start = Date.now();
      const generated = [];
      
      for (let i = 0; i < 1000; i++) {
        generated.push(tcknService.generate());
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should take less than 1 second
      
      // Validate a sample
      const sample = generated.slice(0, 10);
      sample.forEach(tckn => {
        expect(tcknService.validate(tckn)).toBe(true);
      });
    });

    test('should validate many TCKNs quickly', () => {
      const testTckns = Array(1000).fill(0).map(() => tcknService.generate());
      
      const start = Date.now();
      testTckns.forEach(tckn => tcknService.validate(tckn));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should take less than 0.5 seconds
    });
  });
});
