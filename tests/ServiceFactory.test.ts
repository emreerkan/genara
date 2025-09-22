import { ServiceFactory } from '../src/factory/ServiceFactory';
import { ServiceType } from '../src/interfaces/ServiceTypes';
import { TcknService } from '../src/services/tckn/TcknService';
import { VknService } from '../src/services/vkn/VknService';
import { IbanService } from '../src/services/iban/IbanService';
import { CreditCardService } from '../src/services/creditcard/CreditCardService';
import { ImeiService } from '../src/services/imei/ImeiService';
import { IsbnService } from '../src/services/isbn/IsbnService';
import { EanService } from '../src/services/ean/EanService';

describe('ServiceFactory', () => {
    beforeEach(() => {
        // Clear any cached service instances before each test
        (ServiceFactory as any).serviceInstances.clear();
    });

    describe('getService', () => {
        it('should return TCKN service instance', () => {
            const service = ServiceFactory.getService(ServiceType.TCKN);
            expect(service).toBeInstanceOf(TcknService);
            expect(service.getName()).toBe('TCKN');
        });

        it('should return VKN service instance', () => {
            const service = ServiceFactory.getService(ServiceType.VKN);
            expect(service).toBeInstanceOf(VknService);
            expect(service.getName()).toBe('VKN');
        });

        it('should return IBAN service instance', () => {
            const service = ServiceFactory.getService(ServiceType.IBAN);
            expect(service).toBeInstanceOf(IbanService);
            expect(service.getName()).toBe('IBAN');
        });

        it('should return Credit Card service instance', () => {
            const service = ServiceFactory.getService(ServiceType.CREDIT_CARD);
            expect(service).toBeInstanceOf(CreditCardService);
            expect(service.getName()).toBe('creditcard');
        });

        it('should return IMEI service instance', () => {
            const service = ServiceFactory.getService(ServiceType.IMEI);
            expect(service).toBeInstanceOf(ImeiService);
            expect(service.getName()).toBe('imei');
        });

        it('should return ISBN service instance', () => {
            const service = ServiceFactory.getService(ServiceType.ISBN);
            expect(service).toBeInstanceOf(IsbnService);
            expect(service.getName()).toBe('ISBN');
        });

        it('should return EAN service instance', () => {
            const service = ServiceFactory.getService(ServiceType.EAN);
            expect(service).toBeInstanceOf(EanService);
            expect(service.getName()).toBe('EAN');
        });

        it('should return the same instance on multiple calls (singleton pattern)', () => {
            const service1 = ServiceFactory.getService(ServiceType.TCKN);
            const service2 = ServiceFactory.getService(ServiceType.TCKN);
            expect(service1).toBe(service2);
        });

        it('should handle string input for service types', () => {
            const service = ServiceFactory.getService('tckn');
            expect(service).toBeInstanceOf(TcknService);
        });

        it('should handle aliases for service types', () => {
            const eanService = ServiceFactory.getService('upc');
            expect(eanService).toBeInstanceOf(EanService);
            expect(eanService.getName()).toBe('EAN');
        });

        it('should throw error for unknown service type', () => {
            expect(() => ServiceFactory.getService('unknown')).toThrow('Bilinmeyen servis tipi: unknown');
        });

        it('should be case insensitive for aliases', () => {
            const service1 = ServiceFactory.getService('TCKN');
            const service2 = ServiceFactory.getService('tckn');
            expect(service1).toBe(service2);
        });
    });

    describe('getAvailableServices', () => {
        it('should return all available service types', () => {
            const services = ServiceFactory.getAvailableServices();
            expect(services).toContain(ServiceType.TCKN);
            expect(services).toContain(ServiceType.VKN);
            expect(services).toContain(ServiceType.IBAN);
            expect(services).toContain(ServiceType.CREDIT_CARD);
            expect(services).toContain(ServiceType.IMEI);
            expect(services).toContain(ServiceType.ISBN);
            expect(services).toContain(ServiceType.EAN);
            expect(services).toHaveLength(7);
        });
    });

    describe('getServiceAliases', () => {
        it('should return all service aliases', () => {
            const aliases = ServiceFactory.getServiceAliases();
            expect(aliases.tckn).toBe(ServiceType.TCKN);
            expect(aliases.vkn).toBe(ServiceType.VKN);
            expect(aliases.iban).toBe(ServiceType.IBAN);
            expect(aliases.creditcard).toBe(ServiceType.CREDIT_CARD);
            expect(aliases.imei).toBe(ServiceType.IMEI);
            expect(aliases.isbn).toBe(ServiceType.ISBN);
            expect(aliases.ean).toBe(ServiceType.EAN);
            expect(aliases.upc).toBe(ServiceType.EAN);
        });
    });

    describe('detectServiceType', () => {
        it('should detect TCKN (11 digits)', () => {
            const result = ServiceFactory.detectServiceType('12345678950');
            expect(result).toBe(ServiceType.TCKN);
        });

        it('should detect VKN (10 digits) as ambiguous', () => {
            const result = ServiceFactory.detectServiceType('1234567890');
            expect(result).toBeNull(); // Ambiguous between VKN and ISBN
        });

        it('should detect IBAN (TR prefix)', () => {
            const result = ServiceFactory.detectServiceType('TR550001008511810251483613');
            expect(result).toBe(ServiceType.IBAN);
        });

        it('should detect IBAN with partial TR prefix', () => {
            const result = ServiceFactory.detectServiceType('TR55');
            expect(result).toBe(ServiceType.IBAN);
        });

        it('should detect IMEI (15 digits)', () => {
            const result = ServiceFactory.detectServiceType('123456789012348');
            expect(result).toBe(ServiceType.IMEI);
        });

        it('should detect ISBN-10', () => {
            const result = ServiceFactory.detectServiceType('0123456789');
            expect(result).toBeNull(); // Ambiguous between VKN and ISBN
        });

        it('should detect ISBN-13 with 978 prefix as ambiguous', () => {
            const result = ServiceFactory.detectServiceType('9780123456780');
            expect(result).toBeNull(); // Ambiguous between ISBN and EAN
        });

        it('should detect ISBN-13 with 979 prefix as ambiguous', () => {
            const result = ServiceFactory.detectServiceType('9790123456787');
            expect(result).toBeNull(); // Ambiguous between ISBN and EAN
        });

        it('should detect EAN-8', () => {
            const result = ServiceFactory.detectServiceType('12345678');
            expect(result).toBe(ServiceType.EAN);
        });

        it('should detect EAN-13 (13 digits, not ISBN)', () => {
            const result = ServiceFactory.detectServiceType('1234567890123');
            expect(result).toBe(ServiceType.EAN);
        });

        it('should detect UPC-A (12 digits)', () => {
            const result = ServiceFactory.detectServiceType('123456789012');
            expect(result).toBe(ServiceType.EAN);
        });

        it('should detect credit cards with Visa prefix', () => {
            const result = ServiceFactory.detectServiceType('4111111111111111');
            expect(result).toBe(ServiceType.CREDIT_CARD);
        });

        it('should detect credit cards with Mastercard prefix (old)', () => {
            const result = ServiceFactory.detectServiceType('5555555555554444');
            expect(result).toBe(ServiceType.CREDIT_CARD);
        });

        it('should detect credit cards with Mastercard prefix (new)', () => {
            const result = ServiceFactory.detectServiceType('2221000000000009');
            expect(result).toBe(ServiceType.CREDIT_CARD);
        });

        it('should detect credit cards with American Express prefix as ambiguous', () => {
            const result = ServiceFactory.detectServiceType('378282246310005');
            expect(result).toBeNull(); // Ambiguous between IMEI and Credit Card (15 digits)
        });

        it('should return null for ambiguous inputs', () => {
            // 10-digit number could be VKN or ISBN-10
            const result = ServiceFactory.detectServiceType('1234567890');
            expect(result).toBeNull();
        });

        it('should return null for unrecognized patterns', () => {
            const result = ServiceFactory.detectServiceType('abc123');
            expect(result).toBeNull();
        });

        it('should handle spaced input', () => {
            const result = ServiceFactory.detectServiceType('TR55 0001 0085 1181 0251 4836 13');
            expect(result).toBe(ServiceType.IBAN);
        });

        it('should handle ISBN with X check digit', () => {
            const result = ServiceFactory.detectServiceType('123456789X');
            expect(result).toBe(ServiceType.ISBN);
        });
    });

    describe('detectPossibleServiceTypes', () => {
        it('should return IBAN only for TR prefixed numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('TR550001008511810251483613');
            expect(results).toEqual([ServiceType.IBAN]);
        });

        it('should return multiple possibilities for 10-digit numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('1234567890');
            expect(results).toContain(ServiceType.VKN);
            expect(results).toContain(ServiceType.ISBN);
            expect(results.length).toBeGreaterThanOrEqual(2);
        });

        it('should return TCKN for 11-digit numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('12345678901');
            expect(results).toContain(ServiceType.TCKN);
        });

        it('should return EAN for 8-digit numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('12345678');
            expect(results).toContain(ServiceType.EAN);
        });

        it('should return EAN for 12-digit numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('123456789012');
            expect(results).toContain(ServiceType.EAN);
        });

        it('should return ISBN for 13-digit numbers with 978/979 prefix', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('9780123456780');
            expect(results).toContain(ServiceType.ISBN);
        });

        it('should return EAN for 13-digit numbers without ISBN prefix', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('1234567890123');
            expect(results).toContain(ServiceType.EAN);
        });

        it('should return IMEI for 15-digit numbers', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('123456789012345');
            expect(results).toContain(ServiceType.IMEI);
        });

        it('should return credit card for recognized card patterns', () => {
            const visaResults = ServiceFactory.detectPossibleServiceTypes('4111111111111111');
            expect(visaResults).toContain(ServiceType.CREDIT_CARD);

            const mastercardResults = ServiceFactory.detectPossibleServiceTypes('5555555555554444');
            expect(mastercardResults).toContain(ServiceType.CREDIT_CARD);

            const amexResults = ServiceFactory.detectPossibleServiceTypes('378282246310005');
            expect(amexResults).toContain(ServiceType.CREDIT_CARD);
        });

        it('should handle non-numeric input gracefully', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('abc123def');
            expect(results).toEqual([]);
        });

        it('should handle empty input', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('');
            expect(results).toEqual([]);
        });

        it('should handle ISBN-10 with X check digit', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('012345678X');
            expect(results).toEqual([ServiceType.ISBN]);
        });

        it('should be case insensitive for TR prefix', () => {
            const results = ServiceFactory.detectPossibleServiceTypes('tr550001008511810251483613');
            expect(results).toEqual([ServiceType.IBAN]);
        });
    });

    describe('Factory Pattern Integrity', () => {
        it('should create different instances for different service types', () => {
            const tcknService = ServiceFactory.getService(ServiceType.TCKN);
            const vknService = ServiceFactory.getService(ServiceType.VKN);
            expect(tcknService).not.toBe(vknService);
        });

        it('should maintain singleton pattern for each service type', () => {
            const service1 = ServiceFactory.getService(ServiceType.TCKN);
            const service2 = ServiceFactory.getService('tckn');
            const service3 = ServiceFactory.getService('TCKN');
            
            expect(service1).toBe(service2);
            expect(service2).toBe(service3);
        });

        it('should properly implement NumberService interface for all services', () => {
            const serviceTypes = ServiceFactory.getAvailableServices();
            
            serviceTypes.forEach(serviceType => {
                const service = ServiceFactory.getService(serviceType);
                
                expect(typeof service.getName).toBe('function');
                expect(typeof service.getExpectedLength).toBe('function');
                expect(typeof service.validate).toBe('function');
                expect(typeof service.generate).toBe('function');
                expect(typeof service.complete).toBe('function');
            });
        });
    });

    describe('Error Handling', () => {
        it('should throw descriptive error for unsupported service type', () => {
            expect(() => ServiceFactory.getService('unsupported')).toThrow('Bilinmeyen servis tipi: unsupported');
        });

        it('should handle null input gracefully', () => {
            expect(() => ServiceFactory.getService(null as any)).toThrow();
        });

        it('should handle undefined input gracefully', () => {
            expect(() => ServiceFactory.getService(undefined as any)).toThrow();
        });

        it('should handle empty string input', () => {
            expect(() => ServiceFactory.getService('')).toThrow('Bilinmeyen servis tipi: ');
        });
    });

    describe('Service Integration', () => {
        it('should return services that can actually validate their expected formats', () => {
            const serviceTypes = ServiceFactory.getAvailableServices();
            
            serviceTypes.forEach(serviceType => {
                const service = ServiceFactory.getService(serviceType);
                
                // Generate a valid number using the service
                const generated = service.generate();
                
                // The service should validate its own generated numbers
                expect(service.validate(generated)).toBe(true);
            });
        });

        it('should maintain consistent behavior across factory and direct instantiation', () => {
            // Factory instance
            const factoryTckn = ServiceFactory.getService(ServiceType.TCKN);
            
            // Direct instantiation
            const directTckn = new TcknService();
            
            // Both should behave the same way
            const testNumber = '12345678950';
            expect(factoryTckn.validate(testNumber)).toBe(directTckn.validate(testNumber));
            expect(factoryTckn.getName()).toBe(directTckn.getName());
        });
    });

    describe('Performance', () => {
        it('should create services quickly', () => {
            const startTime = Date.now();
            const serviceTypes = ServiceFactory.getAvailableServices();
            
            serviceTypes.forEach(serviceType => {
                ServiceFactory.getService(serviceType);
            });
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(100); // Should take less than 100ms
        });

        it('should detect service types quickly', () => {
            const testInputs = [
                '12345678901', // TCKN
                '1234567890', // VKN
                'TR550001008511810251483613', // IBAN
                '4111111111111111', // Credit Card
                '123456789012345', // IMEI
                '9780123456780', // ISBN
                '1234567890123', // EAN
            ];
            
            const startTime = Date.now();
            
            testInputs.forEach(input => {
                ServiceFactory.detectPossibleServiceTypes(input);
            });
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(50); // Should take less than 50ms
        });
    });

    describe('internal safeguards', () => {
        it('should throw for unsupported service types during creation', () => {
            expect(() => (ServiceFactory as any).createService('unsupported')).toThrow('Desteklenmeyen servis tipi: unsupported');
        });
    });
});
