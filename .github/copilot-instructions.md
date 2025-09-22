# Copilot Instructions for Jenerator Project

## Development Guidelines

### Todo Management
- Always check the `to-do.md` file in the `.github` folder before starting any development
- Mark completed items by changing `[ ]` to `[x]` in the todo list
- Update the todo list as you complete tasks

### Code Standards
- Use TypeScript for all new code
- Follow Factory Pattern architecture with services in separate folders
- Keep Turkish language for user-facing messages (help and error messages)
- Use English for code comments and function documentation
- Minimize dependencies where possible

### Architecture
- Implement Interface-based services with Validate, Generate, and Complete methods
- Services should be in separate folders under `src/services/`
- Each service implements the `NumberService` interface
- Use Factory Pattern for service instantiation

### Project Structure
```
src/
  interfaces/
    NumberService.ts
  services/
    tckn/
    vkn/
    iban/
    creditcard/
    isbn/
    ean/
    imei/
  factory/
    ServiceFactory.ts
  cli/
    index.ts
```

### Dependencies
- Avoid external dependencies where possible
- Use native Node.js APIs for CLI interactions
- TypeScript for type safety

### Testing
- Write unit tests for all services
- Test both validation and generation functions
- Ensure all generated numbers pass validation
