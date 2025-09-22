import { SERVICE_ALIASES } from '../interfaces/ServiceTypes';

/**
 * CLI argument parser interface
 */
export interface CliArgs {
  help: boolean;
  version: boolean;
  service?: string;
  serviceSetViaFlag?: boolean; // Track if service was set via -s flag
  action?: 'generate' | 'validate' | 'complete';
  count: number;
  input?: string;
}

/**
 * Displays usage information
 */
export function showUsage(): void {
  console.log('Jenerator - A Number Validation & Generation Tool');
  console.log('');
  console.log('Kullanım:');
  console.log('  jenerator [options] [input]');
  console.log('');
  console.log('Seçenekler:');
  console.log('  --help, -h              Bu yardım mesajını gösterit');
  console.log('  --version, -v           Versiyon bilgisini gösterit');
  console.log('  --service, -s <service> Belirtilen servisi kullanır (tckn, vkn, iban, creditcard, imei, isbn, ean)');
  console.log('  --action, -a <action>   Yapılacak işlem (generate, validate, complete)');
  console.log('  --count, -c <number>    Belirtilen sayıda üretir (Varsayılan: 1)');
  console.log('');
  console.log('Örnekler:');
  console.log('  jenerator tckn                           # TCKN üret');
  console.log('  jenerator vkn 5                          # 5 adet VKN üret');
  console.log('  jenerator -s creditcard -c 2             # 2 adet kredi kartı üret');
  console.log('  jenerator 12345678901                    # Otomatik algıla ve doğrula');
  console.log('  jenerator TR320010009999901234567890     # IBAN doğrula');
  console.log('  jenerator -s tckn 123456789              # TCKN tamamla');
  console.log('');
  console.log('Desteklenen Servisler: tckn, vkn, iban, creditcard, imei, isbn, ean');
}

/**
 * Displays version information
 */
export function showVersion(): void {
  console.log('jenerator v1.0.0');
}

/**
 * Displays validation result with emoji
 */
export function displayResult(type: string, value: string, isValid: boolean, action: 'doğrulama' | 'üretme' = 'doğrulama', showServiceName: boolean = false): void {
  const emoji = isValid ? '✅' : '❌';
  if (showServiceName) {
    const displayName = getDisplayServiceName(type);
    console.log(`${displayName}: ${value} ${emoji}`);
  } else {
    console.log(`${value} ${emoji}`);
  }
}

/**
 * Gets display-friendly service name
 */
export function getDisplayServiceName(serviceType: string): string {
  const displayNames: Record<string, string> = {
    'tckn': 'TCKN',
    'vkn': 'VKN', 
    'iban': 'IBAN',
    'creditcard': 'Kredi Kartı',
    'imei': 'IMEI',
    'isbn': 'ISBN',
    'ean': 'EAN'
  };
  return displayNames[serviceType] || serviceType.toUpperCase();
}

/**
 * Displays generated result without validation
 */
export function displayGenerated(type: string, value: string): void {
  console.log(value);
}

/**
 * Displays error message
 */
export function displayError(message: string): void {
  console.log(`Hata: ${message}`);
}

/**
 * Prompts user for confirmation and returns their choice
 */
export async function promptConfirmation(message: string): Promise<boolean> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<boolean>((resolve) => {
    rl.question(`${message} (e/h): `, (answer: string) => {
      rl.close();
      const normalized = answer.toLowerCase().trim();
      resolve(normalized === 'e' || normalized === 'evet' || normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Displays multi-service validation result with service names
 */
export function displayMultiServiceResult(serviceName: string, isValid: boolean): void {
  const emoji = isValid ? '✅' : '❌';
  console.log(`${serviceName}: ${emoji}`);
}

/**
 * Checks if a string is a known service name
 */
function isKnownService(input: string): boolean {
  return Object.prototype.hasOwnProperty.call(SERVICE_ALIASES, input.toLowerCase());
}

/**
 * Parses command line arguments
 */
export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    help: false,
    version: false,
    serviceSetViaFlag: false,
    count: 1,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        result.help = true;
        break;
      case '--version':
      case '-v':
        result.version = true;
        break;
      case '--service':
      case '-s':
        if (i + 1 < args.length) {
          result.service = args[++i];
          result.serviceSetViaFlag = true;
        } else {
          throw new Error('--service/-s seçeneği için değer gerekli');
        }
        break;
      case '--action':
      case '-a':
        if (i + 1 < args.length) {
          const action = args[++i];
          if (!['generate', 'validate', 'complete'].includes(action)) {
            throw new Error('--action/-a seçeneği için geçerli değerler: generate, validate, complete');
          }
          result.action = action as 'generate' | 'validate' | 'complete';
        } else {
          throw new Error('--action/-a seçeneği için değer gerekli');
        }
        break;
      case '--count':
      case '-c':
        if (i + 1 < args.length) {
          const count = parseInt(args[++i], 10);
          if (isNaN(count) || count < 1) {
            throw new Error('--count/-c seçeneği için geçerli bir sayı gerekli');
          }
          result.count = count;
        } else {
          throw new Error('--count/-c seçeneği için değer gerekli');
        }
        break;
      default:
        if (!arg.startsWith('-')) {
          // Check if it's a known service name
          if (isKnownService(arg) && !result.service) {
            result.service = arg;
          }
          // Check if it's a number (could be count or input)
          else if (/^\d+$/.test(arg)) {
            const numValue = parseInt(arg, 10);
            // If we have a service but no count set explicitly
            if (result.service && result.count === 1) {
              // In short format (service name without -s flag), second parameter is always count
              if (!result.serviceSetViaFlag) {
                result.count = numValue;
              } else {
                // When using -s flag, treat as input for completion
                result.input = arg;
              }
            } else if (!result.input) {
              result.input = arg;
            }
          }
          // Check if it's an IBAN pattern (TR followed by digits)
          else if (/^TR\d+$/i.test(arg) && !result.input) {
            result.input = arg;
          }
          // Otherwise treat as input
          else if (!result.input) {
            result.input = arg;
          }
        } else if (arg.startsWith('-')) {
          throw new Error(`Bilinmeyen seçenek: ${arg}`);
        }
        break;
    }
    i++;
  }

  return result;
}
