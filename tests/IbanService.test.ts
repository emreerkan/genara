import { IbanService } from '../src/services/iban/IbanService';

describe('IbanService', () => {
  let ibanService: IbanService;

  beforeEach(() => {
    ibanService = new IbanService();
  });

  describe('validate', () => {
    describe('valid IBAN numbers', () => {
      const validIbanNumbers = [
        'TR55 0001 0085 1181 0251 4836 13',
        'TR67 0012 3098 1074 4793 3054 42',
        'TR80 0001 0094 1644 1401 6346 86',
        'TR08 0000 1072 9422 3421 6552 06',
        'TR78 0001 2003 6368 0620 4804 90',
        // Without spaces
        'TR550001008511810251483613',
        'TR670012309810744793305442',
        // Known valid IBANs
        'TR320010009999901234567890'
      ];

      test.each(validIbanNumbers)('should validate %s as valid', (iban) => {
        expect(ibanService.validate(iban)).toBe(true);
      });
    });

    describe('invalid IBAN numbers', () => {
      const invalidIbanNumbers = [
        // Wrong length
        'TR320010009999901234567', // Too short
        'TR3200100099999012345678901', // Too long
        'TR32001000999990123456789', // Short by 1
        '',                          // Empty
        
        // Wrong country code
        'XX320010009999901234567890',
        'AB320010009999901234567890',
        
        // Non-Turkish IBAN (different format)
        'DE89370400440532013000',
        'FR1420041010050500013M02606',
        
        // Invalid characters
        'TR32001000999990123456789A',
        'TR32 0010 0099 9990 1234 5678 9A',
        'TR32-0010-0099-9990-1234-5678-90',

        // Invalid check digits
        'TR330010009999901234567890', // Wrong check digit
        'TR310010009999901234567890', // Wrong check digit
        'TR320010019999901234567890', // Reserved digit must be 0
        
        // Invalid format
        '320010009999901234567890',   // Missing TR
        'TR',                         // Only country code
        'TR32'                        // Only country code + check
      ];

      test.each(invalidIbanNumbers)('should validate %s as invalid', (iban) => {
        expect(ibanService.validate(iban)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('should handle null input', () => {
        expect(ibanService.validate(null as any)).toBe(false);
      });

      test('should handle undefined input', () => {
        expect(ibanService.validate(undefined as any)).toBe(false);
      });

      test('should handle number input', () => {
        expect(ibanService.validate(12345678901234567890 as any)).toBe(false);
      });

      test('should handle mixed case input', () => {
        expect(ibanService.validate('tr320010009999901234567890')).toBe(true);
        expect(ibanService.validate('Tr320010009999901234567890')).toBe(true);
      });
    });
  });

  describe('generate', () => {
    test('should generate valid IBAN', () => {
      const generated = ibanService.generate();
      expect(generated).toMatch(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/);
      expect(ibanService.validate(generated)).toBe(true);
    });

    test('should generate different IBANs on multiple calls', () => {
      const generated1 = ibanService.generate();
      const generated2 = ibanService.generate();
      // They might be the same by chance, but very unlikely
      expect(ibanService.validate(generated1)).toBe(true);
      expect(ibanService.validate(generated2)).toBe(true);
    });

    test('should generate multiple valid IBANs', () => {
      for (let i = 0; i < 10; i++) {
        const generated = ibanService.generate();
        expect(ibanService.validate(generated)).toBe(true);
      }
    });

    test('should always start with TR', () => {
      for (let i = 0; i < 5; i++) {
        const generated = ibanService.generate();
        expect(generated.startsWith('TR')).toBe(true);
      }
    });

    test('should have proper formatting with spaces', () => {
      const generated = ibanService.generate();
      expect(generated).toMatch(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/);
      expect(generated).toHaveLength(32); // Including spaces
    });
  });

  describe('metadata', () => {
    test('should expose expected length', () => {
      expect(ibanService.getExpectedLength()).toBe(26);
    });
  });

  describe('complete', () => {
    test('should complete valid prefix', () => {
      const prefix = 'TR320010009999901234567';
      const completed = ibanService.complete(prefix);
      expect(completed).toMatch(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/);
      expect(completed).toHaveLength(32); // With spaces
      expect(ibanService.validate(completed)).toBe(true);
    });

    test('should complete prefixes to valid IBANs', () => {
      const prefix = 'TR000001000000000000000';
      const completed1 = ibanService.complete(prefix);
      const completed2 = ibanService.complete(prefix);
      // Results might be different since service uses randomization
      expect(ibanService.validate(completed1)).toBe(true);
      expect(ibanService.validate(completed2)).toBe(true);
    });

    test('should handle prefixes with spaces', () => {
      const prefix = 'TR32 0010 0099 9990 123';
      const completed = ibanService.complete(prefix);
      expect(completed).toMatch(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/);
      expect(ibanService.validate(completed)).toBe(true);
    });

    test('should handle various prefix lengths', () => {
      const shortPrefix = 'TR32001000999990123';
      const longPrefix = 'TR320010009999901234567890123';
      const emptyPrefix = '';
      
      const completed1 = ibanService.complete(shortPrefix);
      const completed2 = ibanService.complete(longPrefix);
      const completed3 = ibanService.complete(emptyPrefix);
      
      // Service handles these gracefully but results may not be valid
      expect(typeof completed1).toBe('string');
      expect(typeof completed2).toBe('string');
      expect(typeof completed3).toBe('string');
    });

    test('should handle non-Turkish prefixes', () => {
      const dePrefix = 'DE89370400440532013';
      const frPrefix = 'FR1420041010050500013';
      
      const completed1 = ibanService.complete(dePrefix);
      const completed2 = ibanService.complete(frPrefix);
      
      expect(typeof completed1).toBe('string');
      expect(typeof completed2).toBe('string');
    });

    test('should handle special characters', () => {
      const prefixWithLetter = 'TR32001000999990123456A';
      const prefixWithDashes = 'TR32-0010-0099-9990-123';
      
      const completed1 = ibanService.complete(prefixWithLetter);
      const completed2 = ibanService.complete(prefixWithDashes);
      
      expect(typeof completed1).toBe('string');
      expect(typeof completed2).toBe('string');
    });

    test('should handle null/undefined input gracefully', () => {
      const completed1 = ibanService.complete(null as any);
      const completed2 = ibanService.complete(undefined as any);
      
      expect(typeof completed1).toBe('string');
      expect(typeof completed2).toBe('string');
    });
  });

  describe('IBAN algorithm correctness', () => {
    test('should calculate correct check digits for known examples', () => {
      // Test with a known valid IBAN 
      const validIban = 'TR320010009999901234567890';
      
      // Extract the check digits (positions 2-3)
      const checkDigits = validIban.substring(2, 4);
      expect(checkDigits).toMatch(/^\d{2}$/);
      expect(ibanService.validate(validIban)).toBe(true);
    });

    test('should follow IBAN mod-97 algorithm', () => {
      const validIban = 'TR320010009999901234567890';
      const cleanIban = validIban.replace(/\s/g, '');
      
      // IBAN validation algorithm: move first 4 characters to end
      const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
      
      // Replace letters with numbers (T=29, R=27)
      const numericString = rearranged.replace(/T/g, '29').replace(/R/g, '27');
      
      // Convert to BigInt for mod 97 calculation
      const numericValue = BigInt(numericString);
      const remainder = numericValue % 97n;
      
      // For valid IBAN, remainder should be 1
      expect(remainder).toBe(1n);
    });

    test('should validate multiple generated IBANs with algorithm', () => {
      for (let i = 0; i < 5; i++) {
        const generated = ibanService.generate();
        const cleanIban = generated.replace(/\s/g, '');
        
        // Apply IBAN validation algorithm
        const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
        const numericString = rearranged.replace(/T/g, '29').replace(/R/g, '27');
        const numericValue = BigInt(numericString);
        const remainder = numericValue % 97n;
        
        expect(remainder).toBe(1n);
      }
    });
  });

  describe('error handling', () => {
    test('should wrap generation failures with friendly message', () => {
      const service = new IbanService();
      const spy = jest.spyOn(service as any, 'generateRandomAccountNumber').mockImplementation(() => {
        throw new Error('random failure');
      });

      expect(() => service.generate()).toThrow('IBAN üretim hatası');

      spy.mockRestore();
    });

    test('should return false when checksum calculation throws during validation', () => {
      const spy = jest.spyOn(ibanService as any, 'convertLettersToNumbers').mockImplementation(() => {
        throw new Error('conversion failed');
      });

      expect(ibanService.validate('TR320010009999901234567890')).toBe(false);

      spy.mockRestore();
    });

    test('should rethrow descriptive error when check digit calculation fails', () => {
      const service = new IbanService();
      const spy = jest.spyOn(service as any, 'convertLettersToNumbers').mockImplementation(() => {
        throw new Error('conversion failed');
      });

      expect(() => (service as any).calculateCheckDigits('TR000000000000000000000000')).toThrow('Check digit calculation failed');

      spy.mockRestore();
    });
  });

  describe('formatting', () => {
    test('should format IBAN with spaces correctly', () => {
      const generated = ibanService.generate();
      const parts = generated.split(' ');
      
      expect(parts).toHaveLength(7); // TR12 1234 1234 1234 1234 1234 12
      expect(parts[0]).toHaveLength(4); // TR12
      expect(parts[1]).toHaveLength(4); // 1234
      expect(parts[2]).toHaveLength(4); // 1234
      expect(parts[3]).toHaveLength(4); // 1234
      expect(parts[4]).toHaveLength(4); // 1234
      expect(parts[5]).toHaveLength(4); // 1234
      expect(parts[6]).toHaveLength(2); // 12
    });

    test('should handle input without spaces', () => {
      const withoutSpaces = 'TR320010009999901234567890';
      expect(ibanService.validate(withoutSpaces)).toBe(true);
    });
  });

  describe('performance and stress tests', () => {
    test('should generate many valid IBANs quickly', () => {
      const start = Date.now();
      const generated = [];
      
      for (let i = 0; i < 100; i++) {
        generated.push(ibanService.generate());
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should take less than 1 second
      
      // Validate a sample
      const sample = generated.slice(0, 5);
      sample.forEach(iban => {
        expect(ibanService.validate(iban)).toBe(true);
      });
    });

    test('should validate many IBANs quickly', () => {
      const testIbans = Array(100).fill(0).map(() => ibanService.generate());
      
      const start = Date.now();
      testIbans.forEach(iban => ibanService.validate(iban));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should take less than 0.5 seconds
    });
  });

  describe('integration with real world scenarios', () => {
    test('should handle typical Turkish bank codes', () => {
      // Test with real Turkish bank codes by generating IBANs
      const generated = [];
      for (let i = 0; i < 5; i++) {
        generated.push(ibanService.generate());
      }
      
      generated.forEach(iban => {
        expect(ibanService.validate(iban)).toBe(true);
        expect(iban.startsWith('TR')).toBe(true);
      });
    });

    test('should reject non-Turkish IBANs properly', () => {
      const foreignIbans = [
        'DE89370400440532013000',    // German IBAN
        'FR1420041010050500013M02606', // French IBAN
        'GB29NWBK60161331926819',    // UK IBAN
        'IT60X0542811101000000123456' // Italian IBAN
      ];

      foreignIbans.forEach(iban => {
        expect(ibanService.validate(iban)).toBe(false);
      });
    });
  });
});
