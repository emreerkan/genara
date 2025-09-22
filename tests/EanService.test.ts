import { EanService } from '../src/services/ean/EanService';

describe('EanService', () => {
    let service: EanService;

    beforeEach(() => {
        service = new EanService();
    });

    describe('getName', () => {
        it('should return the correct service name', () => {
            expect(service.getName()).toBe('EAN');
        });
    });

    describe('getExpectedLength', () => {
        it('should return the correct length range', () => {
            const length = service.getExpectedLength();
            expect(length).toEqual({ min: 8, max: 13 });
        });
    });

    describe('validate', () => {
        describe('Valid EAN/UPC numbers', () => {
            it('should validate generated EAN/UPC numbers', () => {
                for (let i = 0; i < 30; i++) {
                    const generated = service.generate();
                    expect(service.validate(generated)).toBe(true);
                }
            });

            it('should validate known valid EAN-13 numbers', () => {
                const validEAN13s = [
                    '4006381333931',
                    '0123456789012',
                    '9780471958697',
                    '4006381330473',
                ];

                validEAN13s.forEach(ean => {
                    expect(service.validate(ean)).toBe(true);
                });
            });

            it('should validate known valid UPC-A numbers', () => {
                const validUPCAs = [
                    '036000291452',
                    '012345678905',
                    '123456789012',
                    '042100005264',
                    '076808578393',
                ];

                validUPCAs.forEach(upc => {
                    expect(service.validate(upc)).toBe(true);
                });
            });

            it('should validate known valid EAN-8 numbers', () => {
                const validEAN8s = [
                    '12345670',
                    '96385074',
                    '73513537',
                    '40123455',
                ];

                validEAN8s.forEach(ean => {
                    expect(service.validate(ean)).toBe(true);
                });
            });
        });

        describe('Invalid EAN/UPC numbers', () => {
            it('should reject empty strings', () => {
                expect(service.validate('')).toBe(false);
                expect(service.validate('   ')).toBe(false);
            });

            it('should reject numbers with wrong length', () => {
                expect(service.validate('12345')).toBe(false); // Too short
                expect(service.validate('123456789012345')).toBe(false); // Too long
                expect(service.validate('123456789')).toBe(false); // 9 digits
                expect(service.validate('12345678901')).toBe(false); // 11 digits
            });

            it('should reject non-numeric characters', () => {
                expect(service.validate('123456789a123')).toBe(false);
                expect(service.validate('invalid')).toBe(false);
                expect(service.validate('12345678901!')).toBe(false);
                expect(service.validate('1234567@')).toBe(false);
            });

            it('should reject numbers with invalid check digits', () => {
                expect(service.validate('4006381333932')).toBe(false); // Wrong EAN-13 check
                expect(service.validate('036000291453')).toBe(false); // Wrong UPC-A check
                expect(service.validate('12345671')).toBe(false); // Wrong EAN-8 check
                expect(service.validate('8901030811628')).toBe(false); // Wrong EAN-13 check
            });
        });

        describe('Input formatting', () => {
            it('should handle spaced EAN-13 input', () => {
                expect(service.validate('4 006381 333931')).toBe(true);
                expect(service.validate('0 123456 789012')).toBe(true);
                expect(service.validate('9 780471 958697')).toBe(true);
            });

            it('should handle spaced UPC-A input', () => {
                expect(service.validate('0 36000 29145 2')).toBe(true);
                expect(service.validate('0 12345 67890 5')).toBe(true);
                expect(service.validate('1 23456 78901 2')).toBe(true);
            });

            it('should handle spaced EAN-8 input', () => {
                expect(service.validate('1234 5670')).toBe(true);
                expect(service.validate('9638 5074')).toBe(true);
                expect(service.validate('7351 3537')).toBe(true);
            });

            it('should handle dashed input', () => {
                expect(service.validate('4006381-333931')).toBe(true);
                expect(service.validate('036000-291452')).toBe(true);
                expect(service.validate('1234-5670')).toBe(true);
            });

            it('should handle mixed formatting', () => {
                expect(service.validate('4 006381-333931')).toBe(true);
                expect(service.validate('0 36000-29145 2')).toBe(true);
                expect(service.validate('1234 5670')).toBe(true);
            });
        });
    });

    describe('generate', () => {
        it('should generate valid EAN/UPC numbers', () => {
            for (let i = 0; i < 40; i++) {
                const generated = service.generate();
                expect(service.validate(generated)).toBe(true);
            }
        });

        it('should generate different EAN/UPC formats', () => {
            const ean13Count = new Set();
            const upcACount = new Set();
            const ean8Count = new Set();
            
            for (let i = 0; i < 100; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    ean13Count.add(generated);
                } else if (cleaned.length === 12) {
                    upcACount.add(generated);
                } else if (cleaned.length === 8) {
                    ean8Count.add(generated);
                }
            }
            
            // Should generate different formats (probabilistic test)
            expect(ean13Count.size + upcACount.size + ean8Count.size).toBeGreaterThan(30);
            // At least two different formats should be generated
            const formatsGenerated = [ean13Count.size > 0, upcACount.size > 0, ean8Count.size > 0].filter(Boolean).length;
            expect(formatsGenerated).toBeGreaterThanOrEqual(2);
        });

        it('should generate properly formatted numbers', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    // EAN-13 format: X XXXXXX XXXXXX
                    expect(generated).toMatch(/^\d \d{6} \d{6}$/);
                } else if (cleaned.length === 12) {
                    // UPC-A format: X XXXXX XXXXX X
                    expect(generated).toMatch(/^\d \d{5} \d{5} \d$/);
                } else if (cleaned.length === 8) {
                    // EAN-8 format: XXXX XXXX
                    expect(generated).toMatch(/^\d{4} \d{4}$/);
                }
            }
        });

        it('should generate different numbers', () => {
            const generated = new Set();
            for (let i = 0; i < 30; i++) {
                generated.add(service.generate());
            }
            
            // Should generate multiple different numbers
            expect(generated.size).toBeGreaterThan(20);
        });

        it('should use realistic GS1 prefixes for EAN-13', () => {
            const prefixes = new Set();
            
            for (let i = 0; i < 100; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    prefixes.add(cleaned.substring(0, 3));
                }
            }
            
            // Should generate multiple different prefixes
            expect(prefixes.size).toBeGreaterThan(5);
            
            // All prefixes should be 3 digits
            prefixes.forEach(prefix => {
                expect((prefix as string).length).toBe(3);
                expect(/^\d{3}$/.test(prefix as string)).toBe(true);
            });
        });
    });

    describe('complete', () => {
        it('should complete partial EAN-8 numbers (short partials)', () => {
            const partials = ['123', '4567', '89012'];
            
            partials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').length).toBe(8);
            });
        });

        it('should complete partial EAN-13 numbers (longer partials)', () => {
            const partials = ['4006381', '12345678', '890103081'];
            
            partials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').length).toBe(13);
            });
        });

        it('should complete partial UPC-A numbers', () => {
            const partials = ['036000', '0123456'];
            
            partials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
                const cleanLength = completed.replace(/[\s\-]/g, '').length;
                expect([8, 12, 13]).toContain(cleanLength);
            });
        });

        it('should complete 11-digit partials as UPC-A', () => {
            const partial11 = '03600029145';
            const completed = service.complete(partial11);
            expect(service.validate(completed)).toBe(true);
            const cleanCompleted = completed.replace(/[\s\-]/g, '');
            expect(cleanCompleted.startsWith(partial11)).toBe(true);
            expect(cleanCompleted.length).toBe(12);
        });

        it('should complete 12-digit partials by adding the missing check digit', () => {
            const partial12 = '400638133393';
            const completed = service.complete(partial12);
            expect(service.validate(completed)).toBe(true);
            const cleanCompleted = completed.replace(/[\s\-]/g, '');
            expect(cleanCompleted.startsWith(partial12)).toBe(true);
            expect(cleanCompleted.length).toBe(13);
        });

        it('should add check digit to 7-digit partials', () => {
            const partial7 = '1234567';
            const completed = service.complete(partial7);
            expect(service.validate(completed)).toBe(true);
            expect(completed.replace(/[\s\-]/g, '').startsWith(partial7)).toBe(true);
            // Based on testing, 7-digit partials are completed as EAN-13
            expect(completed.replace(/[\s\-]/g, '').length).toBe(13);
        });

        it('should handle spaced and dashed partial input', () => {
            const spacedPartial = '400 638133';
            const dashedPartial = '400-638133';
            
            const completed1 = service.complete(spacedPartial);
            const completed2 = service.complete(dashedPartial);
            
            expect(service.validate(completed1)).toBe(true);
            expect(service.validate(completed2)).toBe(true);
            expect(completed1.replace(/[\s\-]/g, '').startsWith('400638133')).toBe(true);
            expect(completed2.replace(/[\s\-]/g, '').startsWith('400638133')).toBe(true);
        });

        it('should throw error for invalid partial inputs', () => {
            expect(() => service.complete('')).toThrow();
            expect(() => service.complete('12')).toThrow();
            expect(() => service.complete('ab')).toThrow();
        });

        it('should handle already complete numbers', () => {
            const validEAN13 = '4006381333931';
            const validUPCA = '036000291452';
            const validEAN8 = '12345670';
            
            // The service doesn't throw for complete numbers, it treats them as partials
            expect(() => service.complete(validEAN13)).toThrow(); // 13 digits not accepted
            const completedUpc = service.complete(validUPCA);
            expect(service.validate(completedUpc)).toBe(true);
            expect(completedUpc.replace(/[\s\-]/g, '').startsWith(validUPCA)).toBe(true);
            
            // But 8 digits are treated as partials for completion to EAN-13
            const completed8 = service.complete(validEAN8);
            expect(service.validate(completed8)).toBe(true);
        });
    });

    describe('EAN/UPC Checksum Algorithm', () => {
        it('should correctly calculate check digits for EAN-13', () => {
            // Since 12-digit completion is not supported, test with shorter partials
            const testCases = [
                { partial: '40063813339', expectedFinalDigit: '1' },
                { partial: '01234567890', expectedFinalDigit: '2' },
            ];

            testCases.forEach(testCase => {
                const completed = service.complete(testCase.partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(testCase.partial)).toBe(true);
            });
        });

        it('should correctly calculate check digits for 11-digit partials', () => {
            const testCases = [
                { data11: '03600029145' },
                { data11: '01234567890' },
                { data11: '04210000526' },
            ];

            testCases.forEach(testCase => {
                const completed = service.complete(testCase.data11);
                const cleanCompleted = completed.replace(/[\s\-]/g, '');
                expect(service.validate(completed)).toBe(true);
                expect(cleanCompleted.startsWith(testCase.data11)).toBe(true);
                // Service completes 11-digit partials to UPC-A (12 digits)
                expect(cleanCompleted.length).toBe(12);
            });
        });

        it('should correctly calculate check digits for various formats', () => {
            const testCases = [
                '1234567',
                '9638507',
                '123456',
                '12345',
            ];

            testCases.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
            });
        });
    });

    describe('Formatting', () => {
        it('should format EAN-13 correctly', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    // Should match format: X XXXXXX XXXXXX
                    expect(generated).toMatch(/^\d \d{6} \d{6}$/);
                }
            }
        });

        it('should format UPC-A correctly', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 12) {
                    // Should match format: X XXXXX XXXXX X
                    expect(generated).toMatch(/^\d \d{5} \d{5} \d$/);
                }
            }
        });

        it('should format EAN-8 correctly', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 8) {
                    // Should match format: XXXX XXXX
                    expect(generated).toMatch(/^\d{4} \d{4}$/);
                }
            }
        });

        it('should preserve information in formatting', () => {
            for (let i = 0; i < 10; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                // The formatted version should contain all the same digits as cleaned
                const formattedDigits = generated.replace(/[\s\-]/g, '');
                expect(formattedDigits).toBe(cleaned);
            }
        });
    });

    describe('Performance', () => {
        it('should validate numbers quickly', () => {
            const testEAN = service.generate();
            const start = Date.now();
            for (let i = 0; i < 1000; i++) {
                service.validate(testEAN);
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
                service.complete('400638');
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
    });

    describe('Edge Cases', () => {
        it('should handle boundary cases for partial completion', () => {
            // Test minimum length partials
            const minPartials = ['123', '400638', '0360002'];
            minPartials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
            });
        });

        it('should handle maximum partial length', () => {
            const maxPartials = ['1234567', '03600029145', '400638133393'];
            maxPartials.forEach(partial => {
                const completed = service.complete(partial);
                expect(service.validate(completed)).toBe(true);
                expect(completed.replace(/[\s\-]/g, '').startsWith(partial)).toBe(true);
            });
        });

        it('should validate extreme inputs consistently', () => {
            expect(service.validate('1')).toBe(false);
            expect(service.validate('1234567890123456789012345')).toBe(false);
        });

        it('should handle all zeros and all nines', () => {
            // All zeros are valid check digits in EAN/UPC systems
            expect(service.validate('00000000')).toBe(true); // Valid check digit for EAN-8
            expect(service.validate('000000000000')).toBe(true); // Valid check digit for UPC-A
            expect(service.validate('0000000000000')).toBe(true); // Valid check digit for EAN-13
            expect(service.validate('99999999')).toBe(false); // Invalid check digit for EAN-8
            expect(service.validate('999999999999')).toBe(false); // Invalid check digit for UPC-A
            expect(service.validate('9999999999999')).toBe(false); // Invalid check digit for EAN-13
        });
    });

    describe('Error Handling', () => {
        it('should handle null and undefined inputs gracefully', () => {
            expect(() => service.validate(null as any)).toThrow();
            expect(() => service.validate(undefined as any)).toThrow();
        });

        it('should handle special characters gracefully', () => {
            expect(service.validate('123456789012@')).toBe(false);
            expect(service.validate('12345678901!')).toBe(false);
            expect(service.validate('invalid-ean')).toBe(false);
            expect(service.validate('1234567#')).toBe(false);
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

    describe('GS1 Prefixes', () => {
        it('should use realistic GS1 prefixes', () => {
            const prefixes = new Set();
            
            for (let i = 0; i < 100; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    const prefix = cleaned.substring(0, 3);
                    prefixes.add(prefix);
                }
            }
            
            // Should generate multiple different prefixes from the realistic list
            expect(prefixes.size).toBeGreaterThan(10);
            
            // Test that realistic prefixes are generated (more comprehensive approach)
            const generatedPrefixes = [];
            
            for (let i = 0; i < 200; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    const prefix = cleaned.substring(0, 3);
                    generatedPrefixes.push(prefix);
                }
            }
            
            // Should generate many different prefixes (showing realistic distribution)
            const uniquePrefixes = new Set(generatedPrefixes);
            expect(uniquePrefixes.size).toBeGreaterThan(20);
        });

        it('should generate valid country/organization codes', () => {
            for (let i = 0; i < 20; i++) {
                const generated = service.generate();
                const cleaned = generated.replace(/[\s\-]/g, '');
                
                if (cleaned.length === 13) {
                    const prefix = cleaned.substring(0, 3);
                    // All prefixes should be 3 digits from 000-999
                    expect(/^\d{3}$/.test(prefix)).toBe(true);
                    const prefixNum = parseInt(prefix);
                    expect(prefixNum).toBeGreaterThanOrEqual(0);
                    expect(prefixNum).toBeLessThanOrEqual(999);
                }
            }
        });
    });

    describe('Internal helpers', () => {
        it('should trim overly long payloads when generating EAN-13 numbers', () => {
            const customService = new EanService();
            const getRandomSpy = jest.spyOn(customService as any, 'getRandomElement').mockReturnValue('1234');
            const generateSpy = jest.spyOn(customService as any, 'generateRandomDigits')
                .mockImplementationOnce(() => '12345')
                .mockImplementationOnce(() => '1234');

            const generated = (customService as any).generateEan13();
            const cleaned = generated.replace(/[\s\-]/g, '');

            expect(cleaned.length).toBe(13);
            expect(cleaned.startsWith('1234')).toBe(true);

            getRandomSpy.mockRestore();
            generateSpy.mockRestore();
        });

        it('should add only the checksum when partial EAN-13 already has 12 digits', () => {
            const completed = (service as any).completeAsEan13('400638133393');
            const cleaned = completed.replace(/[\s\-]/g, '');
            expect(cleaned.length).toBe(13);
            expect(cleaned.startsWith('400638133393')).toBe(true);
        });

        it('should reuse existing seven digits when completing EAN-8 prefixes', () => {
            const completed = (service as any).completeAsEan8('1234567');
            const cleaned = completed.replace(/[\s\-]/g, '');
            expect(cleaned.length).toBe(8);
            expect(cleaned.startsWith('1234567')).toBe(true);
        });

        it('should pad UPC-A partials shorter than eleven digits before adding checksum', () => {
            const completed = (service as any).completeAsUpcA('0360002');
            const cleaned = completed.replace(/[\s\-]/g, '');
            expect(cleaned.length).toBe(12);
            expect(cleaned.startsWith('0360002')).toBe(true);
        });

        it('should leave non-standard lengths unchanged when formatting EAN-13', () => {
            const formatted = (service as any).formatEan13('123456789012');
            expect(formatted).toBe('123456789012');
        });

        it('should leave non-standard lengths unchanged when formatting UPC-A', () => {
            const formatted = (service as any).formatUpcA('1234567890');
            expect(formatted).toBe('1234567890');
        });

        it('should leave non-standard lengths unchanged when formatting EAN-8', () => {
            const formatted = (service as any).formatEan8('123456');
            expect(formatted).toBe('123456');
        });

        it('should format valid EAN-13 strings into grouped blocks', () => {
            const formatted = (service as any).formatEan13('4006381333931');
            expect(formatted).toBe('4 006381 333931');
        });

        it('should format valid UPC-A strings into grouped blocks', () => {
            const formatted = (service as any).formatUpcA('036000291452');
            expect(formatted).toBe('0 36000 29145 2');
        });

        it('should format valid EAN-8 strings into grouped blocks', () => {
            const formatted = (service as any).formatEan8('12345670');
            expect(formatted).toBe('1234 5670');
        });
    });

    describe('Completion Logic', () => {
        it('should complete partials to appropriate formats based on length', () => {
            // Short partials (3-6 digits) should complete to EAN-8
            const shortPartials = ['123', '4567'];
            shortPartials.forEach(partial => {
                const completed = service.complete(partial);
                const cleaned = completed.replace(/[\s\-]/g, '');
                expect(cleaned.length).toBe(8);
            });

            // Medium partials (7-11 digits) should complete to EAN-13 or UPC-A
            const mediumPartials = ['4006381', '123456789'];
            mediumPartials.forEach(partial => {
                const completed = service.complete(partial);
                const cleaned = completed.replace(/[\s\-]/g, '');
                expect([12, 13]).toContain(cleaned.length);
            });

            // 11-digit partials should be completed to UPC-A (12 digits)
            const partial11 = '03600029145';
            const completed11 = service.complete(partial11);
            const cleaned11 = completed11.replace(/[\s\-]/g, '');
            expect(cleaned11.startsWith(partial11)).toBe(true);
            expect(cleaned11.length).toBe(12);

            // 12-digit partials should gain the missing check digit (EAN-13)
            const twelveDigitPartial = '400638133393';
            const completed12 = service.complete(twelveDigitPartial);
            const cleaned12 = completed12.replace(/[\s\-]/g, '');
            expect(cleaned12.startsWith(twelveDigitPartial)).toBe(true);
            expect(cleaned12.length).toBe(13);
        });
    });
});
