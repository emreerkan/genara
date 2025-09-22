import { ImeiService } from '../src/services/imei/ImeiService';

describe('ImeiService', () => {
    let service: ImeiService;

    beforeEach(() => {
        service = new ImeiService();
    });

    describe('getName', () => {
        it('should return the correct service name', () => {
            expect(service.getName()).toBe('imei');
        });
    });

    describe('getExpectedLength', () => {
        it('should return the correct length', () => {
            expect(service.getExpectedLength()).toBe(15);
        });
    });

    describe('validate', () => {
        describe('Valid IMEI numbers', () => {
            it('should validate generated IMEI numbers', () => {
                for (let i = 0; i < 10; i++) {
                    const generated = service.generate();
                    expect(service.validate(generated)).toBe(true);
                }
            });

            // Test with some known valid IMEI numbers
            it('should validate known valid IMEI numbers', () => {
                // These are test IMEIs that pass Luhn validation
                const validIMEIs = [
                    '123456789012347', // Simple test IMEI
                    '490154203237518', // Another test IMEI
                    '356938035643809', // Another test IMEI
                ];

                validIMEIs.forEach(imei => {
                    expect(service.validate(imei)).toBe(true);
                });
            });
        });

        describe('Invalid IMEI numbers', () => {
            it('should reject empty strings', () => {
                expect(service.validate('')).toBe(false);
                expect(service.validate('   ')).toBe(false);
            });

            it('should reject non-numeric characters', () => {
                expect(service.validate('123456789012abc')).toBe(false);
                expect(service.validate('invalid')).toBe(false);
                expect(service.validate('12345678901234!')).toBe(false);
            });

            it('should reject numbers with wrong length', () => {
                expect(service.validate('12345')).toBe(false); // Too short
                expect(service.validate('1234567890123456')).toBe(false); // Too long
                expect(service.validate('1234567890123')).toBe(false); // Too short
            });

            it('should reject numbers with invalid Luhn check', () => {
                expect(service.validate('123456789012348')).toBe(false); // Wrong check digit
                expect(service.validate('490154203237519')).toBe(false); // Wrong check digit
                expect(service.validate('356938035643808')).toBe(false); // Wrong check digit
            });
        });

        describe('Input formatting', () => {
            it('should handle spaced input', () => {
                // Generate a valid IMEI and test with spaces
                const generated = service.generate();
                const cleanIMEI = generated.replace(/\s/g, '');
                
                // Test various spacing formats
                expect(service.validate(cleanIMEI)).toBe(true);
                expect(service.validate(generated)).toBe(true); // Already formatted
                
                // Test with different spacing
                const spacedIMEI = cleanIMEI.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4 $5');
                expect(service.validate(spacedIMEI)).toBe(true);
            });

            it('should handle dashed input', () => {
                const generated = service.generate();
                const cleanIMEI = generated.replace(/\s/g, '');
                const dashedIMEI = cleanIMEI.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4-$5');
                expect(service.validate(dashedIMEI)).toBe(true);
            });

            it('should handle dotted input', () => {
                const generated = service.generate();
                const cleanIMEI = generated.replace(/\s/g, '');
                const dottedIMEI = cleanIMEI.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4.$5');
                expect(service.validate(dottedIMEI)).toBe(true);
            });

            it('should handle mixed formatting', () => {
                const generated = service.generate();
                const cleanIMEI = generated.replace(/\s/g, '');
                const mixedIMEI = cleanIMEI.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2-$3.$4 $5');
                expect(service.validate(mixedIMEI)).toBe(true);
            });
        });
    });

    describe('validateDetailed', () => {
        it('should return detailed error for empty input', () => {
            const result = service.validateDetailed('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('IMEI numarası boş olamaz');
        });

        it('should return detailed error for wrong length', () => {
            const result = service.validateDetailed('12345');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('IMEI numarası tam olarak 15 haneli olmalıdır');
        });

        it('should return detailed error for invalid Luhn', () => {
            const result = service.validateDetailed('123456789012348');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('IMEI numarası geçersiz (Luhn kontrolü başarısız)');
        });

        it('should return valid result for correct IMEI', () => {
            const generated = service.generate();
            const result = service.validateDetailed(generated);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeUndefined();
        });
    });

    describe('generate', () => {
        it('should generate valid IMEI numbers', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                expect(service.validate(generated)).toBe(true);
            }
        });

        it('should generate formatted numbers with spaces', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                expect(generated).toContain(' '); // Should contain spaces
                expect(generated.replace(/\s/g, '').length).toBe(15); // Should be 15 digits when cleaned
            }
        });

        it('should generate numbers with valid length', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                expect(cleanNumber.length).toBe(15);
            }
        });

        it('should generate numbers with recognized TAC codes', () => {
            const tacCodes = new Set();
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const tac = cleanNumber.substring(0, 8);
                tacCodes.add(tac);
                
                // TAC should be 8 digits
                expect(tac.length).toBe(8);
                expect(/^\d{8}$/.test(tac)).toBe(true);
            }
            
            // Should generate multiple different TACs
            expect(tacCodes.size).toBeGreaterThan(1);
        });

        it('should generate numbers with different serial numbers', () => {
            const serialNumbers = new Set();
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const serial = cleanNumber.substring(8, 14);
                serialNumbers.add(serial);
                
                // Serial should be 6 digits
                expect(serial.length).toBe(6);
                expect(/^\d{6}$/.test(serial)).toBe(true);
            }
            
            // Should generate multiple different serials
            expect(serialNumbers.size).toBeGreaterThan(1);
        });

        it('should generate numbers with valid check digits', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const checkDigit = cleanNumber.substring(14, 15);
                
                // Check digit should be single digit
                expect(checkDigit.length).toBe(1);
                expect(/^\d$/.test(checkDigit)).toBe(true);
                
                // The whole number should pass Luhn validation
                expect(service.validate(generated)).toBe(true);
            }
        });
    });

    describe('complete', () => {
        it('should complete partial IMEI numbers with TAC', () => {
            const tac = '01215200'; // Apple TAC
            const completed = service.complete(tac);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(tac)).toBe(true);
            expect(completed.replace(/\s/g, '').length).toBe(15);
        });

        it('should complete partial IMEI numbers with TAC and partial serial', () => {
            const partial = '0121520012'; // TAC + partial serial
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
            expect(completed.replace(/\s/g, '').length).toBe(15);
        });

        it('should complete partial IMEI numbers with TAC and full serial', () => {
            const partial = '01215200123456'; // TAC + full serial (14 digits)
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
            expect(completed.replace(/\s/g, '').length).toBe(15);
        });

        it('should handle spaced partial input', () => {
            const partial = '01 215200 1234';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith('012152001234')).toBe(true);
        });

        it('should handle dashed partial input', () => {
            const partial = '01-215200-1234';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith('012152001234')).toBe(true);
        });

        it('should handle dotted partial input', () => {
            const partial = '01.215200.1234';
            const completed = service.complete(partial);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/\s/g, '').startsWith('012152001234')).toBe(true);
        });

        it('should throw error for empty input', () => {
            expect(() => {
                service.complete('');
            }).toThrow('En az 8 haneli TAC kodu gereklidir');
        });

        it('should throw error for too short input', () => {
            expect(() => {
                service.complete('1234567');
            }).toThrow('En az 8 haneli TAC kodu gereklidir');
        });

        it('should throw error for already complete numbers', () => {
            const fullIMEI = service.generate();
            expect(() => {
                service.complete(fullIMEI);
            }).toThrow('IMEI numarası zaten tamamlanmış');
            
            expect(() => {
                service.complete(fullIMEI.replace(/\s/g, ''));
            }).toThrow('IMEI numarası zaten tamamlanmış');
        });

        it('should complete different partial lengths correctly', () => {
            const partials = ['01215200', '012152001', '0121520012', '01215200123', '012152001234', '0121520012345'];
            
            partials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
                expect(completed.replace(/\s/g, '').length).toBe(15);
            });
        });
    });

    describe('Luhn Algorithm', () => {
        it('should correctly validate known Luhn valid numbers', () => {
            const validNumbers = [
                '123456789012347',
                '490154203237518',
                '356938035643809',
            ];

            validNumbers.forEach(number => {
                expect(service.validate(number)).toBe(true);
            });
        });

        it('should correctly reject known Luhn invalid numbers', () => {
            const invalidNumbers = [
                '123456789012348', // Last digit changed
                '490154203237519', // Last digit changed
                '356938035643808', // Last digit changed
            ];

            invalidNumbers.forEach(number => {
                expect(service.validate(number)).toBe(false);
            });
        });

        it('should calculate correct Luhn check digits', () => {
            // Test with known payloads and expected check digits
            const testCases = [
                { payload: '12345678901234', expectedCheckDigit: '7' },
                { payload: '49015420323751', expectedCheckDigit: '8' },
                { payload: '35693803564380', expectedCheckDigit: '9' },
            ];

            testCases.forEach(testCase => {
                const completed = service.complete(testCase.payload);
                const cleanCompleted = completed.replace(/\s/g, '');
                expect(cleanCompleted.charAt(14)).toBe(testCase.expectedCheckDigit);
                expect(service.validate(completed)).toBe(true);
            });
        });
    });

    describe('TAC (Type Allocation Code)', () => {
        it('should use valid TAC codes from the common list', () => {
            const tacCodes = new Set();
            
            for (let i = 0; i < 50; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const tac = cleanNumber.substring(0, 8);
                tacCodes.add(tac);
            }
            
            // Should have multiple different TACs
            expect(tacCodes.size).toBeGreaterThan(5);
            
            // Each TAC should be 8 digits
            tacCodes.forEach(tac => {
                expect((tac as string).length).toBe(8);
                expect(/^\d{8}$/.test(tac as string)).toBe(true);
            });
        });

        it('should generate IMEIs with known manufacturer TACs', () => {
            const manufacturerTACs = {
                apple: ['01215200', '01215300', '01215400', '01332100', '01332200'],
                samsung: ['35238708', '35238709', '35238710', '35999205', '35999206'],
                huawei: ['86446003', '86446103', '86446203', '35316409', '35316410'],
            };

            // Generate enough IMEIs to likely hit different manufacturers
            const foundTACs = new Set();
            for (let i = 0; i < 100; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                const tac = cleanNumber.substring(0, 8);
                foundTACs.add(tac);
            }

            // Should find TACs from multiple manufacturers
            let foundManufacturers = 0;
            Object.values(manufacturerTACs).forEach(tacList => {
                const hasManufacturer = tacList.some(tac => foundTACs.has(tac));
                if (hasManufacturer) foundManufacturers++;
            });

            expect(foundManufacturers).toBeGreaterThan(0);
        });
    });

    describe('Formatting', () => {
        it('should format IMEI numbers correctly', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                
                // Should match the format: XX XXXXXX XXXXXX X
                expect(generated).toMatch(/^\d{2} \d{6} \d{6} \d$/);
                
                // Should be exactly 18 characters (15 digits + 3 spaces)
                expect(generated.length).toBe(18);
            }
        });

        it('should preserve IMEI information in formatting', () => {
            for (let i = 0; i < 5; i++) {
                const generated = service.generate();
                const cleanNumber = generated.replace(/\s/g, '');
                
                // TAC should be first 8 digits
                const tac = cleanNumber.substring(0, 8);
                expect(generated.startsWith(tac.substring(0, 2))).toBe(true);
                
                // Serial should be next 6 digits
                const serial = cleanNumber.substring(8, 14);
                expect(generated.includes(serial)).toBe(true);
                
                // Check digit should be last digit
                const checkDigit = cleanNumber.substring(14, 15);
                expect(generated.endsWith(checkDigit)).toBe(true);
            }
        });
    });

    describe('Performance', () => {
        it('should validate numbers quickly', () => {
            const testIMEI = service.generate();
            const start = Date.now();
            for (let i = 0; i < 1000; i++) {
                service.validate(testIMEI);
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
                service.complete('01215200');
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
    });

    describe('Edge Cases', () => {
        it('should handle boundary cases for partial completion', () => {
            // Test minimum length partials (8 digits - just TAC)
            const minPartials = ['01215200', '35238708', '86446003'];
            minPartials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
            });
        });

        it('should handle maximum partial length (14 digits)', () => {
            const maxPartials = ['01215200123456', '35238708987654', '86446003555555'];
            maxPartials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/\s/g, '').startsWith(partial)).toBe(true);
                expect(completed.replace(/\s/g, '').length).toBe(15);
            });
        });

        it('should validate extreme inputs consistently', () => {
            expect(service.validate('1')).toBe(false);
            expect(service.validate('1234567890123456789012345')).toBe(false);
        });

        it('should handle all zeros and all nines', () => {
            expect(service.validate('000000000000000')).toBe(true); // Valid Luhn (sum = 0)
            expect(service.validate('999999999999999')).toBe(false); // Invalid Luhn
        });
    });

    describe('Error Handling', () => {
        it('should handle null and undefined inputs gracefully', () => {
            expect(() => service.validate(null as any)).toThrow();
            expect(() => service.validate(undefined as any)).toThrow();
        });

        it('should handle special characters gracefully', () => {
            expect(service.validate('123456789012@#$')).toBe(false);
            expect(service.validate('123456789012!@#')).toBe(false);
            expect(service.validate('123456789012abc')).toBe(false);
        });

        it('should handle very long strings gracefully', () => {
            const veryLong = '1'.repeat(1000);
            expect(service.validate(veryLong)).toBe(false);
        });

        it('should handle empty and whitespace strings', () => {
            expect(service.validate('')).toBe(false);
            expect(service.validate('   ')).toBe(false);
            expect(service.validate('\t\n\r')).toBe(false);
        });
    });

    describe('internal helpers', () => {
        it('should select TAC codes from the predefined list', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
            const tac = (service as any).getRandomTac();
            expect(tac).toBe((ImeiService as any).COMMON_TACS[0]);
            randomSpy.mockRestore();
        });
    });
});
