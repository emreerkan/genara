import { NumberService } from '../../interfaces/NumberService';

/**
 * Service for EAN (European Article Number) and UPC (Universal Product Code) operations
 * Supports EAN-13, EAN-8, and UPC-A formats
 */
export class EanService implements NumberService {
  
  /**
   * Common GS1 country/organization prefixes for realistic EAN generation
   */
  private readonly COMMON_GS1_PREFIXES = [
    // Major countries/regions
    '000', '001', '002', '003', '004', '005', '006', '007', '008', '009', // USA/Canada (UPC)
    '020', '021', '022', '023', '024', '025', '026', '027', '028', '029', // Restricted use
    '030', '031', '032', '033', '034', '035', '036', '037', '038', '039', // USA
    '040', '041', '042', '043', '044', '045', '046', '047', '048', '049', // Restricted use
    '050', '051', '052', '053', '054', '055', '056', '057', '058', '059', // Coupons
    '060', '061', '062', '063', '064', '065', '066', '067', '068', '069', // USA
    '070', '071', '072', '073', '074', '075', '076', '077', '078', '079', // USA
    '080', '081', '082', '083', '084', '085', '086', '087', '088', '089', // USA
    '090', '091', '092', '093', '094', '095', '096', '097', '098', '099', // USA
    '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', // USA
    '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', // Restricted use
    '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', // France
    '380', // Bulgaria
    '383', // Slovenia  
    '385', // Croatia
    '387', // Bosnia and Herzegovina
    '400', '401', '402', '403', // Germany
    '450', '451', '452', '453', '454', '455', '456', '457', '458', '459', // Japan
    '460', '461', '462', '463', '464', '465', '466', '467', '468', '469', // Russia
    '470', // Kyrgyzstan
    '471', // Taiwan
    '474', // Estonia
    '475', // Latvia
    '476', // Azerbaijan
    '477', // Lithuania
    '478', // Uzbekistan
    '479', // Sri Lanka
    '480', // Philippines
    '481', // Belarus
    '482', // Ukraine
    '484', // Moldova
    '485', // Armenia
    '486', // Georgia
    '487', // Kazakhstan
    '488', // Tajikistan
    '489', // Hong Kong
    '490', '491', '492', '493', '494', '495', '496', '497', '498', '499', // Japan
    '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', // United Kingdom
    '520', '521', // Greece
    '528', // Lebanon
    '529', // Cyprus
    '530', // Albania
    '531', // Macedonia
    '535', // Malta
    '539', // Ireland
    '540', '541', '542', '543', '544', '545', '546', '547', '548', '549', // Belgium/Luxembourg
    '560', // Portugal
    '569', // Iceland
    '570', '571', '572', '573', '574', '575', '576', '577', '578', '579', // Denmark
    '590', // Poland
    '594', // Romania
    '599', // Hungary
    '600', '601', // South Africa
    '603', // Ghana
    '604', // Senegal
    '608', // Bahrain
    '609', // Mauritius
    '611', // Morocco
    '613', // Algeria
    '615', // Nigeria
    '616', // Kenya
    '618', // Ivory Coast
    '619', // Tunisia
    '620', // Tanzania
    '621', // Syria
    '622', // Egypt
    '624', // Libya
    '625', // Jordan
    '626', // Iran
    '627', // Kuwait
    '628', // Saudi Arabia
    '629', // United Arab Emirates
    '640', '641', '642', '643', '644', '645', '646', '647', '648', '649', // Finland
    '690', '691', '692', '693', '694', '695', '696', '697', '698', '699', // China
    '700', '701', '702', '703', '704', '705', '706', '707', '708', '709', // Norway
    '729', // Israel
    '730', '731', '732', '733', '734', '735', '736', '737', '738', '739', // Sweden
    '740', // Guatemala
    '741', // El Salvador
    '742', // Honduras
    '743', // Nicaragua
    '744', // Costa Rica
    '745', // Panama
    '746', // Dominican Republic
    '750', // Mexico
    '754', '755', // Canada
    '759', // Venezuela
    '760', '761', '762', '763', '764', '765', '766', '767', '768', '769', // Switzerland
    '770', '771', // Colombia
    '773', // Uruguay
    '775', // Peru
    '777', // Bolivia
    '778', '779', // Argentina
    '780', // Chile
    '784', // Paraguay
    '786', // Ecuador
    '789', '790', // Brazil
    '800', '801', '802', '803', '804', '805', '806', '807', '808', '809', // Italy
    '840', '841', '842', '843', '844', '845', '846', '847', '848', '849', // Spain
    '850', // Cuba
    '858', // Slovakia
    '859', // Czech Republic
    '860', // Serbia
    '865', // Mongolia
    '867', // North Korea
    '868', '869', // Turkey
    '870', '871', '872', '873', '874', '875', '876', '877', '878', '879', // Netherlands
    '880', // South Korea
    '884', // Cambodia
    '885', // Thailand
    '888', // Singapore
    '890', // India
    '893', // Vietnam
    '896', // Pakistan
    '899', // Indonesia
    '900', '901', '902', '903', '904', '905', '906', '907', '908', '909', // Austria
    '930', '931', '932', '933', '934', '935', '936', '937', '938', '939', // Australia
    '940', '941', '942', '943', '944', '945', '946', '947', '948', '949', // New Zealand
    '950', // GS1 Global Office
    '951', // GS1 Global Office (EPCglobal)
    '955', // Malaysia
    '958', // Macau
    '977', // Serial publications (ISSN)
    '978', '979', // Books (ISBN)
    '980', // Refund receipts
    '981', '982', // Common Currency Coupons
    '990', '991', '992', '993', '994', '995', '996', '997', '998', '999'  // Coupons
  ];

  /**
   * Validates an EAN/UPC number (EAN-13, EAN-8, UPC-A)
   */
  validate(input: string): boolean {
    const cleaned = this.cleanInput(input);
    
    if (cleaned.length === 13) {
      return this.validateEan13(cleaned);
    } else if (cleaned.length === 12) {
      return this.validateUpcA(cleaned);
    } else if (cleaned.length === 8) {
      return this.validateEan8(cleaned);
    }
    
    return false;
  }

  /**
   * Generates a valid EAN/UPC number
   */
  generate(): string {
    // 60% EAN-13, 25% UPC-A, 15% EAN-8
    const rand = Math.random();
    
    if (rand < 0.60) {
      return this.generateEan13();
    } else if (rand < 0.85) {
      return this.generateUpcA();
    } else {
      return this.generateEan8();
    }
  }

  /**
   * Completes a partial EAN/UPC number
   */
  complete(partial: string): string {
    const cleaned = this.cleanInput(partial);
    
    if (cleaned.length >= 3 && cleaned.length < 7) {
      return this.completeAsEan8(cleaned);
    } else if (cleaned.length >= 7 && cleaned.length < 12) {
      return this.completeAsEan13(cleaned);
    } else if (cleaned.length >= 3 && cleaned.length < 12) {
      return this.completeAsUpcA(cleaned);
    }
    
    throw new Error('Girilen kısmi EAN/UPC numarası tamamlanamıyor');
  }

  /**
   * Gets the service name
   */
  getName(): string {
    return 'EAN';
  }

  /**
   * Gets expected length for EAN/UPC numbers
   */
  getExpectedLength(): { min: number; max: number } {
    return { min: 8, max: 13 }; // EAN-8 to EAN-13
  }

  /**
   * Cleans input by removing spaces and hyphens
   */
  private cleanInput(input: string): string {
    return input.replace(/[\s\-]/g, '');
  }

  /**
   * Validates EAN-13 format
   */
  private validateEan13(ean: string): boolean {
    if (!/^\d{13}$/.test(ean)) {
      return false;
    }

    return this.validateChecksum(ean, 13);
  }

  /**
   * Validates UPC-A format (12 digits)
   */
  private validateUpcA(upc: string): boolean {
    if (!/^\d{12}$/.test(upc)) {
      return false;
    }

    return this.validateChecksum(upc, 12);
  }

  /**
   * Validates EAN-8 format
   */
  private validateEan8(ean: string): boolean {
    if (!/^\d{8}$/.test(ean)) {
      return false;
    }

    return this.validateChecksum(ean, 8);
  }

  /**
   * Validates checksum using EAN/UPC algorithm
   */
  private validateChecksum(code: string, length: number): boolean {
    const digits = code.split('').map(Number);
    const dataDigits = digits.slice(0, length - 1);
    const checkDigit = digits[length - 1];

    let sum = 0;
    for (let i = 0; i < dataDigits.length; i++) {
      // Alternating weights: odd positions (from right) get weight 3, even positions get weight 1
      const weight = (dataDigits.length - i) % 2 === 1 ? 3 : 1;
      sum += dataDigits[i] * weight;
    }

    const calculatedCheck = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheck;
  }

  /**
   * Calculates checksum for EAN/UPC
   */
  private calculateChecksum(dataDigits: string): string {
    const digits = dataDigits.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
      // Alternating weights: odd positions (from right) get weight 3, even positions get weight 1
      const weight = (digits.length - i) % 2 === 1 ? 3 : 1;
      sum += digits[i] * weight;
    }
    
    return ((10 - (sum % 10)) % 10).toString();
  }

  /**
   * Generates a valid EAN-13
   */
  private generateEan13(): string {
    const prefix = this.getRandomElement(this.COMMON_GS1_PREFIXES);
    const manufacturer = this.generateRandomDigits(3, 5);
    const product = this.generateRandomDigits(2, 4);
    
    // Ensure we have 12 digits before checksum
    const totalLength = prefix.length + manufacturer.length + product.length;
    let dataDigits = prefix + manufacturer + product;
    
    if (totalLength < 12) {
      dataDigits += this.generateRandomDigits(12 - totalLength);
    } else if (totalLength > 12) {
      dataDigits = dataDigits.substring(0, 12);
    }
    
    const checkDigit = this.calculateChecksum(dataDigits);
    const ean13 = dataDigits + checkDigit;
    
    return this.formatEan13(ean13);
  }

  /**
   * Generates a valid UPC-A (12 digits)
   */
  private generateUpcA(): string {
    // UPC-A typically starts with 0-9
    const firstDigit = Math.floor(Math.random() * 10).toString();
    const manufacturer = this.generateRandomDigits(5);
    const product = this.generateRandomDigits(5);
    
    const dataDigits = firstDigit + manufacturer + product;
    const checkDigit = this.calculateChecksum(dataDigits);
    const upcA = dataDigits + checkDigit;
    
    return this.formatUpcA(upcA);
  }

  /**
   * Generates a valid EAN-8
   */
  private generateEan8(): string {
    // EAN-8 usually has country code (2-3 digits) + manufacturer (2-4 digits) + product (1-2 digits)
    const country = this.generateRandomDigits(2, 3);
    const manufacturer = this.generateRandomDigits(2, 3);
    const product = this.generateRandomDigits(1, 2);
    
    // Ensure we have 7 digits before checksum
    let dataDigits = country + manufacturer + product;
    if (dataDigits.length < 7) {
      dataDigits += this.generateRandomDigits(7 - dataDigits.length);
    } else if (dataDigits.length > 7) {
      dataDigits = dataDigits.substring(0, 7);
    }
    
    const checkDigit = this.calculateChecksum(dataDigits);
    const ean8 = dataDigits + checkDigit;
    
    return this.formatEan8(ean8);
  }

  /**
   * Completes partial EAN as EAN-13
   */
  private completeAsEan13(partial: string): string {
    const needed = 12 - partial.length;
    
    if (needed <= 0) {
      const dataDigits = partial.substring(0, 12);
      const checkDigit = this.calculateChecksum(dataDigits);
      return this.formatEan13(dataDigits + checkDigit);
    }
    
    const completion = this.generateRandomDigits(needed);
    const dataDigits = partial + completion;
    const checkDigit = this.calculateChecksum(dataDigits);
    
    return this.formatEan13(dataDigits + checkDigit);
  }

  /**
   * Completes partial UPC as UPC-A
   */
  private completeAsUpcA(partial: string): string {
    const needed = 11 - partial.length;
    
    if (needed <= 0) {
      const dataDigits = partial.substring(0, 11);
      const checkDigit = this.calculateChecksum(dataDigits);
      return this.formatUpcA(dataDigits + checkDigit);
    }
    
    const completion = this.generateRandomDigits(needed);
    const dataDigits = partial + completion;
    const checkDigit = this.calculateChecksum(dataDigits);
    
    return this.formatUpcA(dataDigits + checkDigit);
  }

  /**
   * Completes partial EAN as EAN-8
   */
  private completeAsEan8(partial: string): string {
    const needed = 7 - partial.length;
    
    if (needed <= 0) {
      const dataDigits = partial.substring(0, 7);
      const checkDigit = this.calculateChecksum(dataDigits);
      return this.formatEan8(dataDigits + checkDigit);
    }
    
    const completion = this.generateRandomDigits(needed);
    const dataDigits = partial + completion;
    const checkDigit = this.calculateChecksum(dataDigits);
    
    return this.formatEan8(dataDigits + checkDigit);
  }

  /**
   * Formats EAN-13 with spaces for readability
   */
  private formatEan13(ean: string): string {
    if (ean.length !== 13) return ean;
    return `${ean.substring(0, 1)} ${ean.substring(1, 7)} ${ean.substring(7, 13)}`;
  }

  /**
   * Formats UPC-A with spaces for readability
   */
  private formatUpcA(upc: string): string {
    if (upc.length !== 12) return upc;
    return `${upc.substring(0, 1)} ${upc.substring(1, 6)} ${upc.substring(6, 11)} ${upc.substring(11)}`;
  }

  /**
   * Formats EAN-8 with spaces for readability
   */
  private formatEan8(ean: string): string {
    if (ean.length !== 8) return ean;
    return `${ean.substring(0, 4)} ${ean.substring(4)}`;
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
}
