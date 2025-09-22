import { NumberService, ValidationResult } from '../../interfaces/NumberService';

/**
 * Credit Card Service
 * Implements validation, generation and completion for credit card numbers using Luhn algorithm
 * Supports major card types: Visa, Mastercard, American Express, Discover, JCB, Diners Club
 */
export class CreditCardService implements NumberService {

    private static readonly CARD_TYPES = {
        visa: {
            patterns: [/^4/],
            lengths: [13, 16, 19],
            name: 'Visa'
        },
        mastercard: {
            patterns: [/^5[1-5]/, /^2[2-7]/],
            lengths: [16],
            name: 'Mastercard'
        },
        amex: {
            patterns: [/^3[47]/],
            lengths: [15],
            name: 'American Express'
        },
        discover: {
            patterns: [/^6011/, /^64[4-9]/, /^65/],
            lengths: [16],
            name: 'Discover'
        },
        jcb: {
            patterns: [/^35[2-8][8-9]/],
            lengths: [16],
            name: 'JCB'
        },
        diners: {
            patterns: [/^3[0689]/],
            lengths: [14],
            name: 'Diners Club'
        }
    };

    /**
     * Validates a credit card number using Luhn algorithm
     */
    validate(input: string): boolean {
        const result = this.validateDetailed(input);
        return result.isValid;
    }

    /**
     * Gets the service name
     */
    getName(): string {
        return 'creditcard';
    }

    /**
     * Gets the expected length range for credit card numbers
     */
    getExpectedLength(): { min: number; max: number } {
        return { min: 13, max: 19 };
    }

    /**
     * Provides detailed validation for a credit card number
     */
    validateDetailed(input: string): ValidationResult {
        const cleanInput = this.cleanInput(input);
        
        if (!cleanInput) {
            return {
                isValid: false,
                errors: ['Kredi kartı numarası boş olamaz']
            };
        }

        if (!/^\d+$/.test(cleanInput)) {
            return {
                isValid: false,
                errors: ['Kredi kartı numarası sadece rakam içermelidir']
            };
        }

        const cardType = this.detectCardType(cleanInput);
        
        if (!cardType) {
            return {
                isValid: false,
                errors: ['Tanınmayan kredi kartı türü']
            };
        }

        if (!cardType.lengths.includes(cleanInput.length)) {
            return {
                isValid: false,
                errors: [`${cardType.name} kartı ${cardType.lengths.join(' veya ')} haneli olmalıdır`]
            };
        }

        if (!this.validateLuhn(cleanInput)) {
            return {
                isValid: false,
                errors: ['Kredi kartı numarası geçersiz (Luhn kontrolü başarısız)']
            };
        }

        return {
            isValid: true
        };
    }

    /**
     * Generates a random valid credit card number
     */
    generate(): string {
        const cardType = this.getRandomCardType();
        const cardInfo = CreditCardService.CARD_TYPES[cardType as keyof typeof CreditCardService.CARD_TYPES];
        
        // Use the first pattern and first length for generation
        const pattern = cardInfo.patterns[0];
        const length = cardInfo.lengths[0];
        
        // Generate a number that matches the pattern
        let cardNumber = this.generateNumberForPattern(pattern, length);
        
        // Calculate and append Luhn check digit
        const payload = cardNumber.substring(0, length - 1);
        const checkDigit = this.calculateLuhnCheckDigit(payload);
        
        return this.formatCardNumber(payload + checkDigit);
    }

    /**
     * Generates a credit card number with specified options
     */
    generateWithOptions(options?: { cardType?: string }): string {
        const cardType = options?.cardType?.toLowerCase() || this.getRandomCardType();
        const cardInfo = CreditCardService.CARD_TYPES[cardType as keyof typeof CreditCardService.CARD_TYPES];
        
        if (!cardInfo) {
            throw new Error(`Desteklenmeyen kart türü: ${options?.cardType}`);
        }

        // Use the first pattern and first length for generation
        const pattern = cardInfo.patterns[0];
        const length = cardInfo.lengths[0];
        
        // Generate a number that matches the pattern
        let cardNumber = this.generateNumberForPattern(pattern, length);
        
        // Calculate and append Luhn check digit
        const payload = cardNumber.substring(0, length - 1);
        const checkDigit = this.calculateLuhnCheckDigit(payload);
        
        return this.formatCardNumber(payload + checkDigit);
    }

    /**
     * Completes a partial credit card number
     */
    complete(partialInput: string): string {
        const cleanInput = this.cleanInput(partialInput);
        
        if (!cleanInput || cleanInput.length < 4) {
            throw new Error('En az 4 haneli başlangıç gereklidir');
        }

        const cardType = this.detectCardType(cleanInput);
        if (!cardType) {
            throw new Error('Kredi kartı türü tespit edilemedi');
        }

        const targetLength = cardType.lengths[0];
        
        if (cleanInput.length >= targetLength) {
            throw new Error('Kredi kartı numarası zaten tamamlanmış');
        }

        // Generate random digits for the remaining positions except the last one (check digit)
        let completed = cleanInput;
        while (completed.length < targetLength - 1) {
            completed += Math.floor(Math.random() * 10).toString();
        }

        // Calculate and append Luhn check digit
        const checkDigit = this.calculateLuhnCheckDigit(completed);
        
        return this.formatCardNumber(completed + checkDigit);
    }

    /**
     * Validates a credit card number using the Luhn algorithm
     */
    private validateLuhn(cardNumber: string): boolean {
        let sum = 0;
        let shouldDouble = false;

        // Process digits from right to left
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

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
        let shouldDouble = true;

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
     * Detects the credit card type based on the number pattern
     */
    private detectCardType(cardNumber: string) {
        for (const [type, info] of Object.entries(CreditCardService.CARD_TYPES)) {
            for (const pattern of info.patterns) {
                if (pattern.test(cardNumber)) {
                    return info;
                }
            }
        }
        return null;
    }

    /**
     * Generates a card number that matches a specific pattern
     */
    private generateNumberForPattern(pattern: RegExp, length: number): string {
        let prefix = '';
        
        if (pattern.source === '^4') {
            prefix = '4';
        } else if (pattern.source === '^5[1-5]') {
            prefix = '5' + (1 + Math.floor(Math.random() * 5)).toString();
        } else if (pattern.source === '^2[2-7]') {
            prefix = '2' + (2 + Math.floor(Math.random() * 6)).toString();
            if (prefix === '22') {
                prefix += (21 + Math.floor(Math.random() * 79)).toString();
            } else if (prefix === '27') {
                prefix += (0 + Math.floor(Math.random() * 21)).toString().padStart(2, '0');
            } else {
                prefix += Math.floor(Math.random() * 100).toString().padStart(2, '0');
            }
        } else if (pattern.source === '^3[47]') {
            prefix = '3' + (Math.random() < 0.5 ? '4' : '7');
        } else if (pattern.source === '^6011') {
            prefix = '6011';
        } else if (pattern.source === '^64[4-9]') {
            prefix = '64' + (4 + Math.floor(Math.random() * 6)).toString();
        } else if (pattern.source === '^65') {
            prefix = '65';
        } else if (pattern.source === '^35[2-8][8-9]') {
            prefix = '35' + (2 + Math.floor(Math.random() * 7)).toString() + (8 + Math.floor(Math.random() * 2)).toString();
        } else if (pattern.source === '^3[0689]') {
            const digits = ['0', '6', '8', '9'];
            prefix = '3' + digits[Math.floor(Math.random() * digits.length)];
        }

        let cardNumber = prefix;
        while (cardNumber.length < length - 1) {
            cardNumber += Math.floor(Math.random() * 10).toString();
        }

        return cardNumber;
    }

    /**
     * Gets a random card type for generation
     */
    private getRandomCardType(): string {
        const types = Object.keys(CreditCardService.CARD_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Cleans input by removing spaces, dashes and other non-digit characters
     */
    private cleanInput(input: string): string {
        return input.replace(/[\s\-]/g, '');
    }

    /**
     * Formats a card number with spaces for readability
     */
    private formatCardNumber(cardNumber: string): string {
        // American Express format: 4-6-5
        if (cardNumber.length === 15) {
            return cardNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
        }
        // Diners Club format: 4-6-4
        else if (cardNumber.length === 14) {
            return cardNumber.replace(/(\d{4})(\d{6})(\d{4})/, '$1 $2 $3');
        }
        // Standard format: 4-4-4-4 (or 4-4-4-4-3 for 19-digit)
        else {
            return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
        }
    }

    /**
     * Masks a card number showing only first 6 and last 4 digits
     */
    private maskCardNumber(cardNumber: string): string {
        if (cardNumber.length < 10) {
            return cardNumber;
        }
        
        const first6 = cardNumber.substring(0, 6);
        const last4 = cardNumber.substring(cardNumber.length - 4);
        const maskLength = cardNumber.length - 10;
        const mask = '*'.repeat(maskLength);
        
        return this.formatCardNumber(first6 + mask + last4);
    }
}