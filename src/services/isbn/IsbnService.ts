import { NumberService } from '../../interfaces/NumberService';

/**
 * Service for ISBN (International Standard Book Number) operations
 * Supports both ISBN-10 and ISBN-13 formats
 */
export class IsbnService implements NumberService {
  
  /**
   * Common publisher prefixes for generating realistic ISBNs
   */
  private readonly COMMON_PREFIXES_ISBN13 = [
    '978', // Most common prefix (Bookland)
    '979'  // Alternative prefix  
  ];

  /**
   * Common group codes for ISBN generation
   */
  private readonly COMMON_GROUPS = [
    '0',   // English language
    '1',   // English language  
    '2',   // French language
    '3',   // German language
    '4',   // Japan
    '5',   // Russian language
    '7',   // China
    '9'    // Turkey
  ];

  /**
   * Validates an ISBN number (both ISBN-10 and ISBN-13)
   */
  validate(input: string): boolean {
    const cleaned = this.cleanInput(input);
    
    if (cleaned.length === 10) {
      return this.validateIsbn10(cleaned);
    } else if (cleaned.length === 13) {
      return this.validateIsbn13(cleaned);
    }
    
    return false;
  }

  /**
   * Generates a valid ISBN number
   */
  generate(): string {
    // 70% chance of generating ISBN-13, 30% chance of ISBN-10
    if (Math.random() < 0.7) {
      return this.generateIsbn13();
    } else {
      return this.generateIsbn10();
    }
  }

  /**
   * Completes a partial ISBN number
   */
  complete(partial: string): string {
    const cleaned = this.cleanInput(partial);
    
    if (cleaned.length >= 3 && cleaned.length < 10) {
      return this.completeAsIsbn10(cleaned);
    } else if (cleaned.length >= 3 && cleaned.length < 13) {
      return this.completeAsIsbn13(cleaned);
    }
    
    throw new Error('Girilen kısmi ISBN numarası tamamlanamıyor');
  }

  /**
   * Cleans input by removing hyphens and spaces
   */
  private cleanInput(input: string): string {
    return input.replace(/[-\s]/g, '').toUpperCase();
  }

  /**
   * Validates ISBN-10 format
   */
  private validateIsbn10(isbn: string): boolean {
    if (!/^[\dX]{10}$/.test(isbn)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn[i], 10);
    }

    const checkDigit = isbn[9];
    const calculatedCheck = this.calculateIsbn10CheckDigit(sum);
    
    return checkDigit === calculatedCheck;
  }

  /**
   * Validates ISBN-13 format
   */
  private validateIsbn13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }

    // Must start with 978 or 979
    if (!isbn.startsWith('978') && !isbn.startsWith('979')) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }

    const checkDigit = parseInt(isbn[12], 10);
    const calculatedCheck = (10 - (sum % 10)) % 10;
    
    return checkDigit === calculatedCheck;
  }

  /**
   * Calculates ISBN-10 check digit
   */
  private calculateIsbn10CheckDigit(sum: number): string {
    const remainder = sum % 11;
    const checkDigit = (11 - remainder) % 11;
    return checkDigit === 10 ? 'X' : checkDigit.toString();
  }

  /**
   * Calculates ISBN-13 check digit
   */
  private calculateIsbn13CheckDigit(isbn12: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn12[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  /**
   * Generates a valid ISBN-10
   */
  private generateIsbn10(): string {
    const group = this.getRandomElement(this.COMMON_GROUPS);
    const publisher = this.generateRandomDigits(2, 4);
    const title = this.generateRandomDigits(3, 5);
    
    // Ensure total length is 9 digits before check digit
    const totalLength = group.length + publisher.length + title.length;
    if (totalLength > 9) {
      return this.generateIsbn10(); // Retry
    }
    
    // Pad with zeros if needed
    const padding = '0'.repeat(9 - totalLength);
    const isbn9 = group + publisher + title + padding;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn9[i], 10);
    }
    
    const checkDigit = this.calculateIsbn10CheckDigit(sum);
    const isbn10 = isbn9 + checkDigit;
    
    return this.formatIsbn10(isbn10);
  }

  /**
   * Generates a valid ISBN-13
   */
  private generateIsbn13(): string {
    const prefix = this.getRandomElement(this.COMMON_PREFIXES_ISBN13);
    const group = this.getRandomElement(this.COMMON_GROUPS);
    const publisher = this.generateRandomDigits(2, 4);
    const title = this.generateRandomDigits(3, 5);
    
    // Ensure total length is 12 digits before check digit
    const totalLength = prefix.length + group.length + publisher.length + title.length;
    if (totalLength > 12) {
      return this.generateIsbn13(); // Retry
    }
    
    // Pad with zeros if needed
    const padding = '0'.repeat(12 - totalLength);
    const isbn12 = prefix + group + publisher + title + padding;
    
    const checkDigit = this.calculateIsbn13CheckDigit(isbn12);
    const isbn13 = isbn12 + checkDigit;
    
    return this.formatIsbn13(isbn13);
  }

  /**
   * Completes partial ISBN as ISBN-10
   */
  private completeAsIsbn10(partial: string): string {
    const needed = 9 - partial.length;
    if (needed <= 0) {
      // Just add check digit
      const padded = partial.padEnd(9, '0');
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += (10 - i) * parseInt(padded[i], 10);
      }
      const checkDigit = this.calculateIsbn10CheckDigit(sum);
      return this.formatIsbn10(padded + checkDigit);
    }

    const completion = this.generateRandomDigits(needed);
    const isbn9 = partial + completion;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn9[i], 10);
    }
    
    const checkDigit = this.calculateIsbn10CheckDigit(sum);
    return this.formatIsbn10(isbn9 + checkDigit);
  }

  /**
   * Completes partial ISBN as ISBN-13
   */
  private completeAsIsbn13(partial: string): string {
    // If doesn't start with 978 or 979, add 978 prefix
    let workingPartial = partial;
    if (!partial.startsWith('978') && !partial.startsWith('979')) {
      workingPartial = '978' + partial;
    }
    
    const needed = 12 - workingPartial.length;
    if (needed <= 0) {
      // Just add check digit
      const isbn12 = workingPartial.substring(0, 12);
      const checkDigit = this.calculateIsbn13CheckDigit(isbn12);
      return this.formatIsbn13(isbn12 + checkDigit);
    }
    
    const completion = this.generateRandomDigits(needed);
    const isbn12 = workingPartial + completion;
    
    const checkDigit = this.calculateIsbn13CheckDigit(isbn12);
    return this.formatIsbn13(isbn12 + checkDigit);
  }

  /**
   * Formats ISBN-10 with hyphens
   */
  private formatIsbn10(isbn: string): string {
    if (isbn.length !== 10) return isbn;
    return `${isbn.substring(0, 1)}-${isbn.substring(1, 4)}-${isbn.substring(4, 9)}-${isbn.substring(9)}`;
  }

  /**
   * Formats ISBN-13 with hyphens
   */
  private formatIsbn13(isbn: string): string {
    if (isbn.length !== 13) return isbn;
    return `${isbn.substring(0, 3)}-${isbn.substring(3, 4)}-${isbn.substring(4, 7)}-${isbn.substring(7, 12)}-${isbn.substring(12)}`;
  }

  /**
   * Generates random digits of specified length
   */
  private generateRandomDigits(min: number, max?: number): string {
    const length = max ? Math.floor(Math.random() * (max - min + 1)) + min : min;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  /**
   * Gets random element from array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Gets the service name
   */
  getName(): string {
    return 'ISBN';
  }

  /**
   * Gets expected length for ISBN numbers
   */
  getExpectedLength(): { min: number; max: number } {
    return { min: 10, max: 13 }; // ISBN-10 and ISBN-13
  }
}
