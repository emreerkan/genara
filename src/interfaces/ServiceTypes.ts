/**
 * Available service types
 */
export enum ServiceType {
  TCKN = 'tckn',
  VKN = 'vkn',
  IBAN = 'iban',
  CREDIT_CARD = 'creditcard',
  ISBN = 'isbn',
  EAN = 'ean',
  IMEI = 'imei',
}

/**
 * Service aliases for CLI usage
 */
export const SERVICE_ALIASES: Record<string, ServiceType> = {
  tckn: ServiceType.TCKN,
  vkn: ServiceType.VKN,
  iban: ServiceType.IBAN,
  creditcard: ServiceType.CREDIT_CARD,
  isbn: ServiceType.ISBN,
  ean: ServiceType.EAN,
  upc: ServiceType.EAN,
  imei: ServiceType.IMEI,
};
