import { CreditCardService } from '../src/services/creditcard/CreditCardService';

describe('CreditCardService', () => {
    let service: CreditCardService;

    beforeEach(() => {
        service = new CreditCardService();
    });

    describe('getName', () => {
        it('should return the correct service name', () => {
            expect(service.getName()).toBe('creditcard');
        });
    });

    describe('getExpectedLength', () => {
        it('should return the correct length range', () => {
            const length = service.getExpectedLength();
            expect(length.min).toBe(13);
            expect(length.max).toBe(19);
        });
    });

    describe('validate', () => {
        describe('Valid credit card numbers', () => {
            // Test with generated valid numbers to ensure they work
            it('should validate generated Visa numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'visa' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate generated Mastercard numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'mastercard' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate generated American Express numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'amex' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate generated Discover numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'discover' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate generated JCB numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'jcb' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate generated Diners Club numbers', () => {
                for (let i = 0; i < 5; i++) {
                    const generated = service.generateWithOptions({ cardType: 'diners' });
                    expect(service.validate(generated)).toBe(true);
                }
            });

            // Test some known valid numbers
            it('should validate known valid numbers', () => {
                expect(service.validate('4532015112830366')).toBe(true);
                expect(service.validate('5555555555554444')).toBe(true);
                expect(service.validate('378282246310005')).toBe(true);
                expect(service.validate('6011111111111117')).toBe(true);
                expect(service.validate('30569309025904')).toBe(true);
            });
        });

        describe('Invalid credit card numbers', () => {
            it('should reject empty strings', () => {
                expect(service.validate('')).toBe(false);
                expect(service.validate('   ')).toBe(false);
            });

            it('should reject non-numeric characters', () => {
                expect(service.validate('4532-0151-1283-036a')).toBe(false);
                expect(service.validate('invalid')).toBe(false);
                expect(service.validate('453201511283036!')).toBe(false);
            });

            it('should reject numbers with invalid Luhn check', () => {
                expect(service.validate('4532015112830365')).toBe(false);
                expect(service.validate('5555555555554445')).toBe(false);
                expect(service.validate('378282246310006')).toBe(false);
            });

            it('should reject numbers with wrong length for card type', () => {
                expect(service.validate('45320151')).toBe(false); // Too short for Visa
                expect(service.validate('453201511283036678901')).toBe(false); // Too long for Visa
                expect(service.validate('55555555555544445')).toBe(false); // Wrong length for Mastercard
                expect(service.validate('37828224631000')).toBe(false); // Too short for Amex
            });

            it('should reject unrecognized card types', () => {
                expect(service.validate('1234567890123456')).toBe(false);
                expect(service.validate('9999999999999995')).toBe(false);
                expect(service.validate('8888888888888888')).toBe(false);
            });
        });

        describe('Input formatting', () => {
            it('should handle spaced input', () => {
                expect(service.validate('4532 0151 1283 0366')).toBe(true);
                expect(service.validate('5555 5555 5555 4444')).toBe(true);
                expect(service.validate('3782 822463 10005')).toBe(true);
            });

            it('should handle dashed input', () => {
                expect(service.validate('4532-0151-1283-0366')).toBe(true);
                expect(service.validate('5555-5555-5555-4444')).toBe(true);
                expect(service.validate('3782-822463-10005')).toBe(true);
            });

            it('should handle mixed formatting', () => {
                expect(service.validate('4532 0151-1283 0366')).toBe(true);
                expect(service.validate('5555-5555 5555-4444')).toBe(true);
            });
        });
    });

    describe('validateDetailed', () => {
        it('should return detailed error for empty input', () => {
            const result = service.validateDetailed('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Kredi kartı numarası boş olamaz');
        });

        it('should return detailed error for non-numeric input', () => {
            const result = service.validateDetailed('4532abc1283');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Kredi kartı numarası sadece rakam içermelidir');
        });

        it('should return detailed error for unrecognized card type', () => {
            const result = service.validateDetailed('1234567890123456');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Tanınmayan kredi kartı türü');
        });

        it('should return detailed error for wrong length', () => {
            const result = service.validateDetailed('45320151');
            expect(result.isValid).toBe(false);
            expect(result.errors?.[0]).toContain('haneli olmalıdır');
        });

        it('should return detailed error for invalid Luhn', () => {
            const result = service.validateDetailed('4532015112830365');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Kredi kartı numarası geçersiz (Luhn kontrolü başarısız)');
        });

        it('should return valid result for correct card', () => {
            const result = service.validateDetailed('4532015112830366');
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeUndefined();
        });
    });

    describe('generate', () => {
        it('should generate valid credit card numbers', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                expect(service.validate(generated)).toBe(true);
            }
        });

        it('should generate formatted numbers with spaces', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                // Should contain spaces as formatting
                expect(generated).toContain(' ');
                // Should be valid after removing spaces
                expect(service.validate(generated)).toBe(true);
            }
        });

        it('should generate numbers with valid length', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const length = cleanNumber.length;
                expect([13, 14, 15, 16, 19]).toContain(length);
            }
        });

        it('should generate numbers for recognized card types', () => {
            const cardTypes = new Set();
            for (let i = 0; i < 50; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                
                if (cleanNumber.startsWith('4')) cardTypes.add('visa');
                else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) cardTypes.add('mastercard');
                else if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) cardTypes.add('amex');
                else if (cleanNumber.startsWith('6011') || cleanNumber.startsWith('64') || cleanNumber.startsWith('65')) cardTypes.add('discover');
                else if (cleanNumber.startsWith('35')) cardTypes.add('jcb');
                else if (cleanNumber.startsWith('30') || cleanNumber.startsWith('36') || cleanNumber.startsWith('38')) cardTypes.add('diners');
            }
            
            // Should generate multiple card types
            expect(cardTypes.size).toBeGreaterThan(1);
        });
    });

    describe('generateWithOptions', () => {
        it('should generate Visa cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'visa' });
                expect(service.validate(generated)).toBe(true);
                expect(generated.replace(/\s/g, '').startsWith('4')).toBe(true);
            }
        });

        it('should generate Mastercard cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'mastercard' });
                expect(service.validate(generated)).toBe(true);
                const cleanNumber = generated.replace(/\s/g, '');
                expect(cleanNumber.startsWith('5') || cleanNumber.startsWith('2')).toBe(true);
            }
        });

        it('should generate American Express cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'amex' });
                expect(service.validate(generated)).toBe(true);
                const cleanNumber = generated.replace(/\s/g, '');
                expect(cleanNumber.startsWith('34') || cleanNumber.startsWith('37')).toBe(true);
                expect(cleanNumber.length).toBe(15);
            }
        });

        it('should generate Discover cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'discover' });
                expect(service.validate(generated)).toBe(true);
                const cleanNumber = generated.replace(/\s/g, '');
                expect(
                    cleanNumber.startsWith('6011') || 
                    cleanNumber.startsWith('64') || 
                    cleanNumber.startsWith('65')
                ).toBe(true);
            }
        });

        it('should generate JCB cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'jcb' });
                expect(service.validate(generated)).toBe(true);
                expect(generated.replace(/\s/g, '').startsWith('35')).toBe(true);
            }
        });

        it('should generate Diners Club cards when specified', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generateWithOptions({ cardType: 'diners' });
                expect(service.validate(generated)).toBe(true);
                const cleanNumber = generated.replace(/\s/g, '');
                // Diners Club patterns are 30, 36, 38, 39
                expect(
                    cleanNumber.startsWith('30') || 
                    cleanNumber.startsWith('36') || 
                    cleanNumber.startsWith('38') ||
                    cleanNumber.startsWith('39')
                ).toBe(true);
                expect(cleanNumber.length).toBe(14);
            }
        });

        it('should handle case insensitive card type', () => {
            const generated = service.generateWithOptions({ cardType: 'VISA' });
            expect(service.validate(generated)).toBe(true);
            expect(generated.replace(/\s/g, '').startsWith('4')).toBe(true);
        });

        it('should throw error for unsupported card type', () => {
            expect(() => {
                service.generateWithOptions({ cardType: 'unknown' });
            }).toThrow('Desteklenmeyen kart türü: unknown');
        });

        it('should generate random card when no options provided', () => {
            const generated = service.generateWithOptions();
            expect(service.validate(generated)).toBe(true);
        });
    });

    describe('complete', () => {
        it('should complete partial Visa numbers', () => {
            const partial = '4532';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
        });

        it('should complete partial Mastercard numbers', () => {
            const partial = '5555555555';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
        });

        it('should complete partial American Express numbers', () => {
            const partial = '378282';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
            expect(completed.replace(/\s/g, '').length).toBe(15);
        });

        it('should complete partial Discover numbers', () => {
            const partial = '6011111';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
        });

        it('should complete partial JCB numbers', () => {
            const partial = '352800';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
        });

        it('should complete partial Diners Club numbers', () => {
            const partial = '305693';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
            expect(completed.replace(/\s/g, '').length).toBe(14);
        });

        it('should handle spaced partial input', () => {
            const partial = '4532 0151';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith('45320151')).toBe(true);
        });

        it('should handle dashed partial input', () => {
            const partial = '4532-0151';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith('45320151')).toBe(true);
        });

        it('should throw error for empty input', () => {
            expect(() => {
                service.complete('');
            }).toThrow('En az 4 haneli başlangıç gereklidir');
        });

        it('should throw error for too short input', () => {
            expect(() => {
                service.complete('123');
            }).toThrow('En az 4 haneli başlangıç gereklidir');
        });

        it('should throw error for unrecognized card type', () => {
            expect(() => {
                service.complete('1234567');
            }).toThrow('Kredi kartı türü tespit edilemedi');
        });

        it('should throw error for already complete numbers', () => {
            expect(() => {
                service.complete('4532015112830366');
            }).toThrow('Kredi kartı numarası zaten tamamlanmış');
        });

        it('should complete different lengths correctly', () => {
            for (let i = 0; i < 10; i++) {
                const partial = '4532015';
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                const cleanCompleted = completed.replace(/\s/g, '');
                expect([13, 16, 19]).toContain(cleanCompleted.length);
            }
        });
    });

    describe('Luhn Algorithm', () => {
        it('should correctly validate known Luhn valid numbers', () => {
            const validNumbers = [
                '4532015112830366', // Visa
                '5555555555554444', // Mastercard
                '378282246310005',  // Amex
                '6011111111111117', // Discover
                '30569309025904',   // Diners
                '3528000000000007', // JCB
            ];

            validNumbers.forEach(number => {
                expect(service.validate(number)).toBe(true);
            });
        });

        it('should correctly reject known Luhn invalid numbers', () => {
            const invalidNumbers = [
                '4532015112830365', // Visa (last digit changed)
                '5555555555554443', // Mastercard (last digit changed)
                '378282246310004',  // Amex (last digit changed)
                '6011111111111116', // Discover (last digit changed)
                '30569309025903',   // Diners (last digit changed)
                '3528000000000006', // JCB (last digit changed)
            ];

            invalidNumbers.forEach(number => {
                expect(service.validate(number)).toBe(false);
            });
        });
    });

    describe('Performance', () => {
        it('should validate numbers quickly', () => {
            const start = Date.now();
            for (let i = 0; i < 1000; i++) {
                service.validate('4532015112830366');
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });

        it('should generate numbers quickly', () => {
            const start = Date.now();
            for (let i = 0; i < 100; i++) {
                service.generate();
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });

        it('should complete numbers quickly', () => {
            const start = Date.now();
            for (let i = 0; i < 100; i++) {
                service.complete('4532015');
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
    });

    describe('Edge Cases', () => {
        it('should handle various card number lengths correctly', () => {
            // Test that each card type generates the correct first length from their possible lengths
            const testCases = [
                { type: 'visa', expectedLength: 13 }, // First length in array
                { type: 'mastercard', expectedLength: 16 },
                { type: 'amex', expectedLength: 15 },
                { type: 'discover', expectedLength: 16 },
                { type: 'jcb', expectedLength: 16 },
                { type: 'diners', expectedLength: 14 }
            ];

            testCases.forEach(testCase => {
                for (let i = 0; i < 3; i++) {
                    const generated = service.generateWithOptions({ cardType: testCase.type });
                    const cleanNumber = generated.replace(/\s/g, '');
                    expect(cleanNumber.length).toBe(testCase.expectedLength);
                    expect(service.validate(generated)).toBe(true);
                }
            });
        });

        it('should handle boundary cases for partial completion', () => {
            // Test minimum length partials
            const minPartials = ['4532', '5555', '3782', '6011', '3528', '3056'];
            minPartials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
            });
        });

        it('should validate extreme length inputs consistently', () => {
            expect(service.validate('4')).toBe(false);
            expect(service.validate('4532015112830366789012345')).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle null and undefined inputs gracefully', () => {
            // These will throw errors due to the cleanInput method, but we can test that they don't validate
            expect(() => service.validate(null as any)).toThrow();
            expect(() => service.validate(undefined as any)).toThrow();
        });

        it('should handle special characters gracefully', () => {
            expect(service.validate('4532@0151!1283#0366')).toBe(false);
            expect(service.validate('4532.0151.1283.0366')).toBe(false);
            expect(service.validate('4532_0151_1283_0366')).toBe(false);
        });

        it('should handle very long strings gracefully', () => {
            const veryLong = '4'.repeat(1000);
            expect(service.validate(veryLong)).toBe(false);
        });
    });

    describe('Internal helpers', () => {
        const runWithRandomSequence = (values: number[], fn: () => void) => {
            const spy = jest.spyOn(Math, 'random').mockImplementation(() => {
                return values.length ? values.shift()! : 0.1;
            });
            try {
                fn();
            } finally {
                spy.mockRestore();
            }
        };

        it('should generate Mastercard 2-series prefixes using the lower boundary', () => {
            runWithRandomSequence([0, 0], () => {
                const payload = (service as any).generateNumberForPattern(/^2[2-7]/, 16);
                expect(payload.startsWith('2221')).toBe(true);
            });
        });

        it('should generate Mastercard 2-series prefixes using the upper boundary', () => {
            runWithRandomSequence([0.999, 0], () => {
                const payload = (service as any).generateNumberForPattern(/^2[2-7]/, 16);
                expect(payload.startsWith('2700')).toBe(true);
            });
        });

        it('should generate Mastercard 2-series prefixes within the mid-range', () => {
            runWithRandomSequence([0.25, 0.42], () => {
                const payload = (service as any).generateNumberForPattern(/^2[2-7]/, 16);
                expect(payload.startsWith('23')).toBe(true);
            });
        });

        it('should generate Discover 64x prefixes within the expected range', () => {
            runWithRandomSequence([0], () => {
                const payload = (service as any).generateNumberForPattern(/^64[4-9]/, 16);
                expect(payload.startsWith('644')).toBe(true);
            });
        });

        it('should generate Discover 65 prefixes correctly', () => {
            const payload = (service as any).generateNumberForPattern(/^65/, 16);
            expect(payload.startsWith('65')).toBe(true);
        });

        it('should mask long card numbers while preserving the first six and last four digits', () => {
            const masked = (service as any).maskCardNumber('1234567890123456');
            expect(masked).toBe('1234 56******3456');
        });

        it('should return short numbers unchanged when masking', () => {
            const masked = (service as any).maskCardNumber('123456789');
            expect(masked).toBe('123456789');
        });

        it('should format 10-digit numbers into 4-4-2 grouping when masking', () => {
            const masked = (service as any).maskCardNumber('1234567890');
            expect(masked).toBe('1234 5678 90');
        });
    });
});
