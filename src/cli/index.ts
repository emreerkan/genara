#!/usr/bin/env node

import { ServiceFactory } from '../factory/ServiceFactory';
import { ServiceType } from '../interfaces/ServiceTypes';
import { showUsage, showVersion, displayResult, displayGenerated, displayError, displayMultiServiceResult, getDisplayServiceName, parseArgs, CliArgs } from './utils';

/**
 * Main CLI application
 */
class JeneratorCLI {
  private args: string[];

  constructor() {
    this.args = process.argv.slice(2);
  }

  /**
   * Runs the CLI application
   */
  async run(): Promise<void> {
    try {
      if (this.args.length === 0) {
        showUsage();
        return;
      }

      const parsedArgs = parseArgs(this.args);

      if (parsedArgs.help) {
        showUsage();
        return;
      }

      if (parsedArgs.version) {
        showVersion();
        return;
      }

      // Determine action if not explicitly provided
      if (!parsedArgs.action) {
        parsedArgs.action = this.determineDefaultAction(parsedArgs);
      }

      // Handle action-based commands
      await this.handleExplicitAction(parsedArgs);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
      process.exit(1);
    }
  }

  /**
   * Determines the default action based on input parameters
   */
  private determineDefaultAction(args: CliArgs): 'generate' | 'validate' | 'complete' {
    // If service is specified and input is provided
    if (args.service && args.input) {
      try {
        const service = ServiceFactory.getService(args.service);
        const expectedLength = service.getExpectedLength();
        const inputLength = args.input.replace(/[\s\-]/g, '').length;

        // Handle both number and range types for expected length
        let isValidLength = false;
        if (typeof expectedLength === 'number') {
          isValidLength = inputLength === expectedLength;
        } else {
          isValidLength = inputLength >= expectedLength.min && inputLength <= expectedLength.max;
        }

        // If input matches validation length -> validate
        if (isValidLength) {
          return 'validate';
        }
        // If input is shorter than expected, it might be for completion
        else if (typeof expectedLength === 'number') {
          // For TCKN/VKN: 9-digit prefix -> complete
          if (inputLength === 9 && /^\d{9}$/.test(args.input)) {
            return 'complete';
          }
        } else {
          // For credit cards: 4+ digits but shorter than min -> complete
          if (inputLength >= 4 && inputLength < expectedLength.min && /^\d+$/.test(args.input.replace(/[\s\-]/g, ''))) {
            return 'complete';
          }
        }
      } catch (error) {
        // Fall back to generate if service is unknown
      }
    }

    // If only input is provided (no service)
    if (args.input && !args.service) {
      // Always return validate - let handleValidate decide between single or multi-service validation
      return 'validate';
    }

    // Default action is generate
    return 'generate';
  }

  /**
   * Handles action-based commands
   */
  private async handleExplicitAction(args: CliArgs): Promise<void> {
    try {
      switch (args.action) {
        case 'generate':
          if (!args.service) {
            displayError('generate işlemi için --service parametresi gerekli');
            showUsage();
            return;
          }
          await this.handleGenerate(args.service, args.input, args.count);
          break;

        case 'validate':
          if (!args.input) {
            displayError('validate işlemi için doğrulanacak değer gerekli');
            showUsage();
            return;
          }
          this.handleValidate(args.input, args.service);
          break;

        case 'complete':
          if (!args.service) {
            displayError('complete işlemi için --service parametresi gerekli');
            showUsage();
            return;
          }
          if (!args.input) {
            displayError('complete işlemi için tamamlanacak prefix gerekli');
            showUsage();
            return;
          }
          this.handleComplete(args.service, args.input);
          break;
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  }

  /**
   * Handles generation requests
   */
  private async handleGenerate(serviceType: string, prefix?: string, count = 1): Promise<void> {
    try {
      const service = ServiceFactory.getService(serviceType);
      
      // Check for high count values and prompt for confirmation
      if (count > 1000) {
        const { promptConfirmation } = await import('./utils');
        console.log(`\n⚠️  Uyarı: ${count} adet sayı üretmek istediğinizi belirtiniz.`);
        console.log('Bu işlem biraz zaman alabilir ve çok fazla çıktı üretecektir.');
        
        const shouldContinue = await promptConfirmation('Devam etmek istediğinizden emin misiniz?');
        
        if (!shouldContinue) {
          console.log('İşlem iptal edildi.');
          return;
        }
        
        console.log('İşlem başlatılıyor...\n');
      }
      
      for (let i = 0; i < count; i++) {
        let result: string;

        if (prefix) {
          result = service.complete(prefix);
        } else {
          result = service.generate();
        }

        displayGenerated(service.getName(), result);
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  }

  /**
   * Handles validation requests
   */
  private handleValidate(value: string, serviceType?: string): void {
    try {
      if (serviceType) {
        // Validate with specific service (don't show service name since user specified it)
        const service = ServiceFactory.getService(serviceType);
        const isValid = service.validate(value);
        displayResult(service.getName(), value, isValid, 'doğrulama', false);
      } else {
        // Check for possible services
        const possibleServices = ServiceFactory.detectPossibleServiceTypes(value);
        
        if (possibleServices.length === 1) {
          // Single service detected (show service name since it was auto-detected)
          const service = ServiceFactory.getService(possibleServices[0]);
          const isValid = service.validate(value);
          displayResult(service.getName(), value, isValid, 'doğrulama', true);
        } else if (possibleServices.length > 1) {
          // Multiple possible services (ambiguous) - validate with all matching services
          this.handleAmbiguousValidation(value, possibleServices);
        } else {
          // No service detected, validate with all services
          this.handleMultiServiceValidation(value);
        }
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  }

  /**
   * Handles ambiguous validation (validate against multiple possible services)
   */
  private handleAmbiguousValidation(value: string, possibleServices: string[]): void {
    for (const serviceType of possibleServices) {
      try {
        const service = ServiceFactory.getService(serviceType);
        const isValid = service.validate(value);
        displayMultiServiceResult(getDisplayServiceName(serviceType), isValid);
      } catch (error) {
        // Skip services that can't handle this input
        displayMultiServiceResult(getDisplayServiceName(serviceType), false);
      }
    }
  }

  /**
   * Handles multi-service validation (validate against all services)
   */
  private handleMultiServiceValidation(value: string): void {
    const availableServices = ServiceFactory.getAvailableServices();
    
    for (const serviceType of availableServices) {
      try {
        const service = ServiceFactory.getService(serviceType);
        const isValid = service.validate(value);
        displayMultiServiceResult(getDisplayServiceName(serviceType), isValid);
      } catch (error) {
        // Skip services that can't handle this input
        displayMultiServiceResult(getDisplayServiceName(serviceType), false);
      }
    }
  }



  /**
   * Handles completion requests
   */
  private handleComplete(serviceType: string, prefix: string): void {
    try {
      const service = ServiceFactory.getService(serviceType);
      const result = service.complete(prefix);
      displayGenerated(service.getName(), result);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  }






}

/**
 * Entry point
 */
if (require.main === module) {
  const cli = new JeneratorCLI();
  cli.run().catch((error) => {
    displayError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    process.exit(1);
  });
}

export { JeneratorCLI };
