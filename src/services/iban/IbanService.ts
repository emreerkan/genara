import { NumberService, ValidationResult, GenerationOptions } from '../../interfaces/NumberService';

/**
 * Service for validating, generating and completing Turkish IBAN numbers
 * IBAN format for Turkey: TR26 (5n bank code, 1n reserved zero, 16c account number)
 */
export class IbanService implements NumberService {
    private readonly COUNTRY_CODE = 'TR';
    private readonly CHECK_DIGIT_LENGTH = 2;
    private readonly BANK_CODE_LENGTH = 5;
    private readonly RESERVED_LENGTH = 1; // Always '0'
    private readonly ACCOUNT_LENGTH = 16;
    private readonly TOTAL_LENGTH = 26;

    // Common Turkish bank codes for generation
    private readonly BANK_CODES = [
        '00001', // Türkiye Cumhuriyet Merkez Bankası
        '00010', // T.C. Ziraat Bankası A.Ş.
        '00012', // Türkiye Halk Bankası A.Ş.
        '00015', // Türkiye Vakıflar Bankası T.A.O.
        '00032', // Türkiye İş Bankası A.Ş.
        '00046', // Akbank T.A.Ş.
        '00062', // Türkiye Garanti Bankası A.Ş.
        '00067', // Yapı ve Kredi Bankası A.Ş.
        '00111', // QNB Finansbank A.Ş.
        '00123', // Türkiye Ekonomi Bankası A.Ş.
        '00134', // Denizbank A.Ş.
        '00135', // Anadolubank A.Ş.
        '00143', // HSBC Bank A.Ş.
        '00146', // Odea Bank A.Ş.
        '00149', // ING Bank A.Ş.
        '00203', // Odeabank A.Ş.
        '00206', // Türk Ekonomi Bankası A.Ş.
    ];

    validate(value: string): boolean {
        try {
            // Remove spaces and convert to uppercase
            const cleanNumber = value.replace(/\s/g, '').toUpperCase();
            
            // Check basic format
            if (!cleanNumber.startsWith(this.COUNTRY_CODE)) {
                return false;
            }

            if (cleanNumber.length !== this.TOTAL_LENGTH) {
                return false;
            }

            // Check character format
            if (!/^TR\d{24}$/.test(cleanNumber)) {
                return false;
            }

            // Extract components
            const reserved = cleanNumber.substring(9, 10);

            // Check reserved digit is zero
            if (reserved !== '0') {
                return false;
            }

            // Validate using MOD-97 algorithm
            return this.validateChecksum(cleanNumber);
        } catch (error) {
            return false;
        }
    }

    generate(): string {
        try {
            // Select random bank code
            const bankCode = this.BANK_CODES[Math.floor(Math.random() * this.BANK_CODES.length)];
            
            // Generate random account number (16 digits)
            const accountNumber = this.generateRandomAccountNumber();
            
            // Construct IBAN without check digits (use 00 as placeholder)
            const ibanWithoutCheckDigits = `${this.COUNTRY_CODE}00${bankCode}0${accountNumber}`;
            
            // Calculate check digits
            const checkDigits = this.calculateCheckDigits(ibanWithoutCheckDigits);
            
            // Construct final IBAN
            const finalIban = `${this.COUNTRY_CODE}${checkDigits}${bankCode}0${accountNumber}`;
            
            return this.formatIban(finalIban);
        } catch (error) {
            throw new Error('IBAN üretim hatası');
        }
    }

    complete(prefix: string): string {
        try {
            const clean = prefix.replace(/\s/g, '').toUpperCase();
            
            // If it doesn't start with TR, add it
            if (!clean.startsWith('TR')) {
                if (clean.length === 0) {
                    return 'TR320010009999901234567890';
                }
                return `TR${clean.padEnd(24, '0')}`;
            }

            // If we have TR but incomplete, generate a complete IBAN
            if (clean.length < this.TOTAL_LENGTH) {
                // Use the first bank code and generate a valid IBAN
                const bankCode = this.BANK_CODES[0];
                const accountNumber = this.generateRandomAccountNumber();
                const baseIban = `${this.COUNTRY_CODE}00${bankCode}0${accountNumber}`;
                const checkDigits = this.calculateCheckDigits(baseIban);
                const fullIban = `${this.COUNTRY_CODE}${checkDigits}${bankCode}0${accountNumber}`;
                return this.formatIban(fullIban);
            }

            return this.formatIban(clean);
        } catch (error) {
            return 'TR320010009999901234567890';
        }
    }

    getName(): string {
        return 'IBAN';
    }

    getExpectedLength(): number {
        return this.TOTAL_LENGTH;
    }

    /**
     * Detailed validation with error messages (for CLI usage)
     */
    validateDetailed(value: string): ValidationResult {
        try {
            // Remove spaces and convert to uppercase
            const cleanNumber = value.replace(/\s/g, '').toUpperCase();
            
            // Check basic format
            if (!cleanNumber.startsWith(this.COUNTRY_CODE)) {
                return {
                    isValid: false,
                    errors: ['IBAN Türkiye ülke kodu ile başlamalıdır (TR)']
                };
            }

            if (cleanNumber.length !== this.TOTAL_LENGTH) {
                return {
                    isValid: false,
                    errors: [`IBAN ${this.TOTAL_LENGTH} karakter olmalıdır`]
                };
            }

            // Check character format
            if (!/^TR\d{24}$/.test(cleanNumber)) {
                return {
                    isValid: false,
                    errors: ['IBAN format geçersiz (TR + 24 rakam olmalıdır)']
                };
            }

            // Extract components
            const reserved = cleanNumber.substring(9, 10);

            // Check reserved digit is zero
            if (reserved !== '0') {
                return {
                    isValid: false,
                    errors: ['IBAN formatında 10. pozisyon sıfır olmalıdır']
                };
            }

            // Validate using MOD-97 algorithm
            const isValidChecksum = this.validateChecksum(cleanNumber);
            if (!isValidChecksum) {
                return {
                    isValid: false,
                    errors: ['IBAN kontrol rakamları geçersiz']
                };
            }

            return {
                isValid: true
            };
        } catch (error) {
            return {
                isValid: false,
                errors: ['IBAN doğrulama hatası']
            };
        }
    }

    /**
     * Get completion suggestions (for CLI usage)
     */
    getCompletionSuggestions(partialNumber: string): string[] {
        try {
            const clean = partialNumber.replace(/\s/g, '').toUpperCase();
            
            // If it doesn't start with TR, add it
            if (!clean.startsWith('TR')) {
                if (clean.length === 0) {
                    return ['TR'];
                }
                return [`TR${clean}`];
            }

            // If we have TR but nothing else, suggest a few examples
            if (clean.length <= 4) {
                return [
                    'TR320010009999901234567890', // Example from standards
                    'TR330006100519786457841326',
                    'TR640001200911200016327426'
                ];
            }

            // If partial IBAN, try to complete with valid examples
            if (clean.length < this.TOTAL_LENGTH) {
                const suggestions = [];
                
                // Try to complete with different bank codes
                for (const bankCode of this.BANK_CODES.slice(0, 3)) {
                    const accountNumber = this.generateRandomAccountNumber();
                    const baseIban = `${this.COUNTRY_CODE}00${bankCode}0${accountNumber}`;
                    const checkDigits = this.calculateCheckDigits(baseIban);
                    const fullIban = `${this.COUNTRY_CODE}${checkDigits}${bankCode}0${accountNumber}`;
                    suggestions.push(this.formatIban(fullIban));
                }
                
                return suggestions;
            }

            return [this.formatIban(clean)];
        } catch (error) {
            return [];
        }
    }

    /**
     * Validates IBAN checksum using MOD-97 algorithm
     */
    private validateChecksum(iban: string): boolean {
        try {
            // Rearrange: move first 4 characters to the end
            const rearranged = iban.substring(4) + iban.substring(0, 4);
            
            // Replace letters with numbers (A=10, B=11, ..., Z=35)
            const numericString = this.convertLettersToNumbers(rearranged);
            
            // Calculate MOD 97
            const remainder = this.calculateMod97(numericString);
            
            return remainder === 1;
        } catch (error) {
            return false;
        }
    }

    /**
     * Calculates check digits for IBAN
     */
    private calculateCheckDigits(ibanWithPlaceholder: string): string {
        try {
            // Replace check digits with 00
            const ibanWithZeros = ibanWithPlaceholder.substring(0, 2) + '00' + ibanWithPlaceholder.substring(4);
            
            // Rearrange: move first 4 characters to the end
            const rearranged = ibanWithZeros.substring(4) + ibanWithZeros.substring(0, 4);
            
            // Replace letters with numbers
            const numericString = this.convertLettersToNumbers(rearranged);
            
            // Calculate MOD 97
            const remainder = this.calculateMod97(numericString);
            
            // Check digits = 98 - remainder
            const checkDigits = 98 - remainder;
            
            return checkDigits.toString().padStart(2, '0');
        } catch (error) {
            throw new Error('Check digit calculation failed');
        }
    }

    /**
     * Converts letters to numbers (A=10, B=11, ..., Z=35)
     */
    private convertLettersToNumbers(input: string): string {
        return input.replace(/[A-Z]/g, (char) => {
            return (char.charCodeAt(0) - 55).toString();
        });
    }

    /**
     * Calculates MOD 97 for large numbers using piece-wise calculation
     */
    private calculateMod97(numericString: string): number {
        let remainder = 0;
        
        for (let i = 0; i < numericString.length; i += 7) {
            const chunk = numericString.substring(i, i + 7);
            const number = parseInt(remainder.toString() + chunk);
            remainder = number % 97;
        }
        
        return remainder;
    }

    /**
     * Generates a random 16-digit account number
     */
    private generateRandomAccountNumber(): string {
        let accountNumber = '';
        for (let i = 0; i < this.ACCOUNT_LENGTH; i++) {
            accountNumber += Math.floor(Math.random() * 10).toString();
        }
        return accountNumber;
    }

    /**
     * Formats IBAN with spaces for readability
     */
    private formatIban(iban: string): string {
        const clean = iban.replace(/\s/g, '');
        let formatted = '';
        
        for (let i = 0; i < clean.length; i += 4) {
            if (i > 0) formatted += ' ';
            formatted += clean.substring(i, i + 4);
        }
        
        return formatted;
    }
}