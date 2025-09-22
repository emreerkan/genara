import { NumberService } from '../../interfaces/NumberService';

/**
 * Turkish Tax Identification Number (VKN) validation and generation service
 */
export class VknService implements NumberService {
  /**
   * Validates a Turkish Tax Identification Number (VKN)
   */
  validate(vkn: string): boolean {
    if (typeof vkn !== 'string') {
      vkn = String(vkn);
    }

    if (vkn.length !== 10) {
      return false;
    }

    if (!/^\d{10}$/.test(vkn)) {
      return false;
    }

    const checkDigit = this.calculateCheckDigit(vkn.substring(0, 9));
    return parseInt(vkn[9], 10) === checkDigit;
  }

  /**
   * Calculates check digit for a 9-digit prefix using VKN algorithm
   */
  private calculateCheckDigit(prefix: string): number {
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      const d = parseInt(prefix[i], 10);
      const pos = i + 1;

      const p = (d + 10 - pos) % 10;

      let q: number;
      if (p === 9) {
        q = 9;
      } else {
        q = (p * Math.pow(2, 10 - pos)) % 9;
      }

      sum += q;
    }

    return (10 - (sum % 10)) % 10;
  }

  /**
   * Validates prefix format
   */
  private validatePrefix(prefix: string): void {
    if (!/^\d{9}$/.test(prefix)) {
      throw new Error('Prefix sadece 9 rakamdan oluşmalıdır');
    }
  }

  /**
   * Generates a random valid VKN
   */
  generate(): string {
    let prefix = '';
    for (let i = 0; i < 9; i++) {
      prefix += Math.floor(Math.random() * 10);
    }
    return this.complete(prefix);
  }

  /**
   * Completes a 9-digit prefix to form a valid 10-digit VKN
   */
  complete(prefix: string): string {
    this.validatePrefix(prefix);
    const checkDigit = this.calculateCheckDigit(prefix);
    return prefix + checkDigit;
  }

  /**
   * Gets the service name
   */
  getName(): string {
    return 'VKN';
  }

  /**
   * Gets the expected length for VKN
   */
  getExpectedLength(): number {
    return 10;
  }
}
