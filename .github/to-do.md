# Genara Project Development Todo

## Phase 1: Project Restructuring
- [x] Clean up inline comments (keep function documentation)
- [x] Translate function documentation to English
- [x] Rename project to `genara`
- [x] Update package.json with new name and CLI configuration
- [x] Convert project to TypeScript
- [x] Create Factory Pattern architecture
- [x] Create NumberService interface
- [x] Refactor TCKN service to use new interface
- [x] Refactor VKN service to use new interface
- [x] Create ServiceFactory for service instantiation
- [x] Update CLI to use new architecture
- [x] Configure project as NPM package

## Phase 2: Generalization
- [x] Remove `t` and `v` shortcuts from CLI
- [x] Remove interactive prompt for service selection
- [x] No need to run validation after generation
- [x] If no parameters are given, show help message
- [x] If the program runs with one argument and it's only digits, then run all services
- [x] If the program runs with one argument and it's a known service then generate with that service
- [x] Create named arguments for service selection (e.g., `--service tckn`)
- [x] Implement help command (e.g., `--help`)
- [x] Create version command (e.g., `--version`)
- [x] Create count argument for generation (e.g., `--count 5`) and implement it in the factory
- [x] Update README with new usage examples
- [x] Add shorthand options for CLI arguments (`-s` for `--service`, `-c` for `--count`)
- [x] Add explicit action parameter (`--action`/`-a`) with generate, validate, complete options
- [x] Remove backward compatibility code and implement smart default action detection
- [x] Remove service name prefixes from output (clean output format)
- [x] Implement direct service name usage (e.g., `genara tckn`, `genara vkn 4`)

## Phase 3: New Services Implementation
- [x] Implement IBAN service (validation, generation, completion)
- [x] Implement Credit Card service (validation, generation with Luhn algorithm)
- [x] Implement IMEI service
- [x] Implement ISBN service (ISBN-10 and ISBN-13)
- [x] Implement EAN/UPC barcode service

## Phase 4: Testing & Documentation
- [x] Write unit tests for all services (408 tests, 87%+ coverage)
- [x] Set up Jest testing framework with TypeScript support
- [x] Create GitHub Actions CI/CD pipeline with automated testing
- [x] Configure Codecov for coverage reporting
- [x] Update README with comprehensive API documentation
- [x] Add TypeScript build configuration
- [x] Add ESLint and Prettier configuration
- [x] Create comprehensive documentation (CONTRIBUTING.md, GitHub templates)

## Phase 5: Publishing
- [x] Configure package for NPM publishing
- [x] Create GitHub Actions for CI/CD
- [x] Publish to NPM registry
- [x] Create GitHub releases

## Notes
- Keep all user-facing messages in Turkish
- Use English for code documentation and comments
- Follow TypeScript best practices
- Implement comprehensive error handling
