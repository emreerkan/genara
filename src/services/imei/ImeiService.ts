import { NumberService, ValidationResult } from '../../interfaces/NumberService';

/**
 * IMEI (International Mobile Equipment Identity) Service
 * Implements validation, generation and completion for IMEI numbers using Luhn algorithm
 * IMEI format: 15 digits total (14 digits + 1 check digit)
 * Structure: TAC (8 digits) + Serial Number (6 digits) + Check Digit (1 digit)
 */
export class ImeiService implements NumberService {

    // Common TAC (Type Allocation Code) prefixes for major manufacturers
    private static readonly COMMON_TACS = [
        // Apple
        '01215200', '01215300', '01215400', '01332100', '01332200',
        // Samsung
        '35238708', '35238709', '35238710', '35999205', '35999206',
        // Huawei
        '86446003', '86446103', '86446203', '35316409', '35316410',
        // Xiaomi
        '86585403', '86585404', '86585405', '86585503', '86585504',
        // Google/Pixel
        '35161511', '35161512', '35161513', '35161514', '35161515',
        // LG
        '35925806', '35925807', '35925808', '35925809', '35925810',
        // Nokia
        '01180000', '01180100', '01180200', '35209900', '35209901',
        // Sony
        '35403906', '35403907', '35403908', '35403909', '35403910',
        // OnePlus
        '86177103', '86177104', '86177105', '86177106', '86177107',
        // Motorola
        '35685302', '35685303', '35685304', '35685305', '35685306'
    ];

    /**
     * Gets the service name
     */
    getName(): string {
        return 'imei';
    }

    /**
     * Gets the expected length for IMEI numbers
     */
    getExpectedLength(): number {
        return 15;
    }

    /**
     * Validates an IMEI number using Luhn algorithm
     */
    validate(input: string): boolean {
        const result = this.validateDetailed(input);
        return result.isValid;
    }

    /**
     * Provides detailed validation for an IMEI number
     */
    validateDetailed(input: string): ValidationResult {
        const cleanInput = this.cleanInput(input);
        
        if (!cleanInput) {
            return {
                isValid: false,
                errors: ['IMEI numarası boş olamaz']
            };
        }

        if (!/^\d{15}$/.test(cleanInput)) {
            return {
                isValid: false,
                errors: ['IMEI numarası tam olarak 15 haneli olmalıdır']
            };
        }

        if (!this.validateLuhn(cleanInput)) {
            return {
                isValid: false,
                errors: ['IMEI numarası geçersiz (Luhn kontrolü başarısız)']
            };
        }

        return {
            isValid: true
        };
    }

    /**
     * Generates a random valid IMEI number
     */
    generate(): string {
        // Select a random TAC (Type Allocation Code)
        const tac = ImeiService.COMMON_TACS[Math.floor(Math.random() * ImeiService.COMMON_TACS.length)];
        
        // Generate 6-digit serial number
        const serialNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        // Combine TAC and serial number (14 digits)
        const payload = tac + serialNumber;
        
        // Calculate Luhn check digit
        const checkDigit = this.calculateLuhnCheckDigit(payload);
        
        // Return formatted IMEI
        return this.formatImei(payload + checkDigit);
    }

    /**
     * Completes a partial IMEI number
     */
    complete(partialInput: string): string {
        const cleanInput = this.cleanInput(partialInput);
        
        if (!cleanInput || cleanInput.length < 8) {
            throw new Error('En az 8 haneli TAC kodu gereklidir');
        }

        if (cleanInput.length >= 15) {
            throw new Error('IMEI numarası zaten tamamlanmış');
        }

        // If we have less than 14 digits, pad with random digits
        let completed = cleanInput;
        while (completed.length < 14) {
            completed += Math.floor(Math.random() * 10).toString();
        }

        // Calculate and append Luhn check digit
        const checkDigit = this.calculateLuhnCheckDigit(completed);
        
        return this.formatImei(completed + checkDigit);
    }

    /**
     * Validates an IMEI number using the Luhn algorithm
     */
    private validateLuhn(imei: string): boolean {
        let sum = 0;
        let shouldDouble = false;

        // Process digits from right to left
        for (let i = imei.length - 1; i >= 0; i--) {
            let digit = parseInt(imei.charAt(i));

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0;
    }

    /**
     * Calculates the Luhn check digit for a given payload
     */
    private calculateLuhnCheckDigit(payload: string): string {
        let sum = 0;
        let shouldDouble = true; // Start with true because we're adding a digit at the end

        // Process digits from right to left
        for (let i = payload.length - 1; i >= 0; i--) {
            let digit = parseInt(payload.charAt(i));

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }

    /**
     * Cleans input by removing spaces, dashes and other non-digit characters
     */
    private cleanInput(input: string): string {
        return input.replace(/[\s\-\.]/g, '');
    }

    /**
     * Formats an IMEI number with spaces for readability
     */
    private formatImei(imei: string): string {
        // Format as: XX XXXXXX XXXXXX X (TAC + Serial + Check)
        return imei.replace(/(\d{2})(\d{6})(\d{6})(\d{1})/, '$1 $2 $3 $4');
    }

    /**
     * Gets a random TAC from the common list
     */
    private getRandomTac(): string {
        return ImeiService.COMMON_TACS[Math.floor(Math.random() * ImeiService.COMMON_TACS.length)];
    }
}