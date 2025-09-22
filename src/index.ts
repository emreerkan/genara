// Main library exports
export { NumberService } from './interfaces/NumberService';
export { ServiceType, SERVICE_ALIASES } from './interfaces/ServiceTypes';
export { ServiceFactory } from './factory/ServiceFactory';

// Individual service exports
export { TcknService } from './services/tckn/TcknService';
export { VknService } from './services/vkn/VknService';
export { IbanService } from './services/iban/IbanService';
export { CreditCardService } from './services/creditcard/CreditCardService';
export { ImeiService } from './services/imei/ImeiService';
export { IsbnService } from './services/isbn/IsbnService';
export { EanService } from './services/ean/EanService';

// Convenience re-exports for common usage patterns
export {
  ServiceFactory as Genara
} from './factory/ServiceFactory';

export {
  TcknService as TCKN
} from './services/tckn/TcknService';

export {
  VknService as VKN
} from './services/vkn/VknService';

export {
  IbanService as IBAN
} from './services/iban/IbanService';

export {
  CreditCardService as CreditCard
} from './services/creditcard/CreditCardService';

export {
  ImeiService as IMEI
} from './services/imei/ImeiService';

export {
  IsbnService as ISBN
} from './services/isbn/IsbnService';

export {
  EanService as EAN
} from './services/ean/EanService';

// Default export for convenience
export { ServiceFactory as default } from './factory/ServiceFactory';
