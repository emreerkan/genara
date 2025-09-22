/**
 * Base interface for all number validation and generation services
 */
export interface NumberService {
  /**
   * Validates a given number according to service-specific rules
   * @param value - The number to validate as string
   * @returns True if valid, false otherwise
   */
  validate(value: string): boolean;

  /**
   * Generates a random valid number
   * @returns A randomly generated valid number as string
   */
  generate(): string;

  /**
   * Completes a partial number using the service algorithm
   * @param prefix - The partial number to complete
   * @returns The completed valid number as string
   * @throws Error if prefix is invalid
   */
  complete(prefix: string): string;

  /**
   * Gets the service name
   * @returns The name of the service
   */
  getName(): string;

  /**
   * Gets the expected length of valid numbers for this service
   * @returns The expected length or range of lengths
   */
  getExpectedLength(): number | { min: number; max: number };
}

/**
 * Validation result with detailed information
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Generation options for services that support customization
 */
export interface GenerationOptions {
  prefix?: string;
  length?: number;
  format?: string;
}
