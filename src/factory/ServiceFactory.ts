import { NumberService } from '../interfaces/NumberService';
import { ServiceType, SERVICE_ALIASES } from '../interfaces/ServiceTypes';
import { TcknService } from '../services/tckn/TcknService';
import { VknService } from '../services/vkn/VknService';
import { IbanService } from '../services/iban/IbanService';
import { CreditCardService } from '../services/creditcard/CreditCardService';
import { ImeiService } from '../services/imei/ImeiService';
import { IsbnService } from '../services/isbn/IsbnService';
import { EanService } from '../services/ean/EanService';

/**
 * Factory class for creating number validation services
 */
export class ServiceFactory {
  private static serviceInstances: Map<ServiceType, NumberService> = new Map();

  /**
   * Creates or retrieves a service instance
   */
  static getService(type: ServiceType | string): NumberService {
    const serviceType = this.normalizeServiceType(type);
    
    if (!this.serviceInstances.has(serviceType)) {
      this.serviceInstances.set(serviceType, this.createService(serviceType));
    }

    return this.serviceInstances.get(serviceType)!;
  }

  /**
   * Gets all available service types
   */
  static getAvailableServices(): ServiceType[] {
    return Object.values(ServiceType);
  }

  /**
   * Gets service aliases for CLI usage
   */
  static getServiceAliases(): Record<string, ServiceType> {
    return SERVICE_ALIASES;
  }

  /**
   * Normalizes service type from string input
   */
  private static normalizeServiceType(type: ServiceType | string): ServiceType {
    if (Object.values(ServiceType).includes(type as ServiceType)) {
      return type as ServiceType;
    }

    const alias = SERVICE_ALIASES[type.toLowerCase()];
    if (alias) {
      return alias;
    }

    throw new Error(`Bilinmeyen servis tipi: ${type}`);
  }

  /**
   * Creates a new service instance
   */
  private static createService(type: ServiceType): NumberService {
    switch (type) {
      case ServiceType.TCKN:
        return new TcknService();
      case ServiceType.VKN:
        return new VknService();
      case ServiceType.IBAN:
        return new IbanService();
      case ServiceType.CREDIT_CARD:
        return new CreditCardService();
      case ServiceType.IMEI:
        return new ImeiService();
      case ServiceType.ISBN:
        return new IsbnService();
      case ServiceType.EAN:
        return new EanService();
      default:
        throw new Error(`Desteklenmeyen servis tipi: ${type}`);
    }
  }

  /**
   * Detects service type based on input length and format
   */
  static detectServiceType(input: string): ServiceType | null {
    const possibleServices = this.detectPossibleServiceTypes(input);
    return possibleServices.length === 1 ? possibleServices[0] : null;
  }

  /**
   * Detects all possible service types for the given input
   */
  static detectPossibleServiceTypes(input: string): ServiceType[] {
    const cleanInput = input.replace(/\s/g, '').toUpperCase();
    const possibleServices: ServiceType[] = [];
    
    // Check for IBAN format (starts with TR and has correct length)
    if (/^TR\d{24}$/.test(cleanInput) || cleanInput.startsWith('TR')) {
      possibleServices.push(ServiceType.IBAN);
      return possibleServices; // IBAN is very specific, return immediately
    }
    
    // Check for ISBN patterns (allows X for ISBN-10)
    if (/^[\dX]+$/.test(cleanInput)) {
      if (cleanInput.length === 10) {
        possibleServices.push(ServiceType.ISBN); // ISBN-10
      } else if (cleanInput.length === 13) {
        if (cleanInput.startsWith('978') || cleanInput.startsWith('979')) {
          possibleServices.push(ServiceType.ISBN); // ISBN-13
        }
      }
    }

    // Check for numeric only patterns
    if (!/^\d+$/.test(cleanInput)) {
      return possibleServices;
    }

    // Check length-based matches first
    switch (cleanInput.length) {
      case 8:
        possibleServices.push(ServiceType.EAN); // EAN-8
        break;
      case 10:
        if (!possibleServices.includes(ServiceType.VKN)) {
          possibleServices.push(ServiceType.VKN);
        }
        break;
      case 11:
        possibleServices.push(ServiceType.TCKN);
        break;
      case 12:
        possibleServices.push(ServiceType.EAN); // UPC-A
        break;
      case 13:
        possibleServices.push(ServiceType.EAN); // EAN-13
        break;
      case 15:
        possibleServices.push(ServiceType.IMEI);
        break;
    }

    // Check for credit card patterns (13-19 digits)
    if (cleanInput.length >= 13 && cleanInput.length <= 19) {
      // Credit card specific patterns
      if (/^4/.test(cleanInput) ||         // Visa
          /^5[1-5]/.test(cleanInput) ||   // Mastercard (old)
          /^2[2-7]/.test(cleanInput) ||   // Mastercard (new)
          /^3[47]/.test(cleanInput) ||    // American Express
          /^6011/.test(cleanInput) ||     // Discover
          /^64[4-9]/.test(cleanInput) ||  // Discover
          /^65/.test(cleanInput) ||       // Discover
          /^35[2-8]/.test(cleanInput) ||  // JCB
          /^3[0689]/.test(cleanInput)) {  // Diners Club
        possibleServices.push(ServiceType.CREDIT_CARD);
      }
    }

    return possibleServices;
  }
}
