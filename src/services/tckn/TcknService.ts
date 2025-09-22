import { NumberService } from '../../interfaces/NumberService';

/**
 * Turkish Identity Number (TCKN) validation and generation service
 */
export class TcknService implements NumberService {
  private static readonly INVALID_PATTERNS = [
    '11111111110',
    '22222222220',
    '33333333330',
    '44444444440',
    '55555555550',
    '66666666660',
    '77777777770',
    '88888888880',
    '99999999990',
  ];

  private static readonly INVALID_PREFIXES = [
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
  ];

  /**
   * Validates a Turkish Identity Number (TCKN)
   */
  validate(tckn: string): boolean {
    if (typeof tckn !== 'string') {
      tckn = String(tckn);
    }

    if (tckn.length !== 11) {
      return false;
    }

    if (!/^\d{11}$/.test(tckn)) {
      return false;
    }

    if (tckn[0] === '0') {
      return false;
    }

    if (TcknService.INVALID_PATTERNS.includes(tckn)) {
      return false;
    }

    const { c10, c11 } = this.calculateCheckDigits(tckn.substring(0, 9));
    
    return (
      parseInt(tckn[9], 10) === c10 &&
      parseInt(tckn[10], 10) === c11
    );
  }

  /**
   * Calculates check digits for a 9-digit prefix
   */
  private calculateCheckDigits(prefix: string): { c10: number; c11: number } {
    let t1 = 0;
    let t2 = 0;

    for (let i = 0; i < 9; i += 2) {
      t1 += parseInt(prefix[i], 10);
    }

    for (let i = 1; i < 8; i += 2) {
      t2 += parseInt(prefix[i], 10);
    }

    const c10 = (10 - (((t1 * 3) + t2) % 10)) % 10;
    const c11 = (10 - ((((t2 + c10) * 3) + t1) % 10)) % 10;

    return { c10, c11 };
  }

  /**
   * Generates a random valid TCKN
   */
  generate(): string {
    let prefix: string;
    do {
      prefix = '';
      prefix += Math.floor(Math.random() * 9) + 1;
      for (let i = 1; i < 9; i++) {
        prefix += Math.floor(Math.random() * 10);
      }
    } while (TcknService.INVALID_PREFIXES.includes(prefix));

    return this.complete(prefix);
  }

  /**
   * Validates prefix format and rules
   */
  private validatePrefix(prefix: string): void {
    if (!/^\d{9}$/.test(prefix)) {
      throw new Error('Prefix sadece 9 rakamdan oluşmalıdır');
    }

    if (prefix[0] === '0') {
      throw new Error('İlk rakam 0 olamaz');
    }

    if (TcknService.INVALID_PREFIXES.includes(prefix)) {
      throw new Error('Geçersiz prefix desenli');
    }
  }

  /**
   * Completes a 9-digit prefix to form a valid 11-digit TCKN
   */
  complete(prefix: string): string {
    this.validatePrefix(prefix);
    const { c10, c11 } = this.calculateCheckDigits(prefix);
    return prefix + c10 + c11;
  }

  /**
   * Gets the service name
   */
  getName(): string {
    return 'TCKN';
  }

  /**
   * Gets the expected length for TCKN
   */
  getExpectedLength(): number {
    return 11;
  }
}
