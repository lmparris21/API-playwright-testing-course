# API Testing with Playwright

This project demonstrates a robust API testing framework built with Playwright Test, focusing on testing REST API endpoints of the Conduit API. The framework showcases best practices for API testing and includes several key features:

### Key Features

- **Fluent Builder Pattern**: A chainable API for constructing requests
- **Automatic Request/Response Logging**: Detailed logging of all API interactions
- **Status Code Validation**: Automatic verification of HTTP status codes with detailed error reporting
- **Custom Fixtures**: Reusable test configurations and setup
- **Authentication Handling**: Built-in support for token-based authentication
- **CRUD Operations**: Complete coverage of Create, Read, Update, Delete operations

### Framework Structure

- `utils/request-handler.ts`: Core request handling with builder pattern implementation
- `utils/logger.ts`: Request/response logging functionality
- `utils/fixtures.ts`: Playwright test fixtures and configurations
- `tests/`: Test suites demonstrating various API testing scenarios

### Test Coverage

The framework includes tests for:
- User Authentication
- Article Management (CRUD operations)
- Tag Retrieval
- Pagination
- Error Handling

The UI is not tested in this project, but can be viewed at https://conduit.bondaracademy.com/ for reference.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Playwright Test for VS Code extension 

## Installation

1. Clone the repository:
```bash
git clone git@github.com:lmparris21/API-playwright-testing-course.git
cd API-playwright-testing-course
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```
## Running Tests

To run all tests:
```bash
npx playwright test
```

To run tests in debug mode:
```bash
npx playwright test --debug
```

To run a specific test file:
```bash
npx playwright test tests/example.spec.ts
```

## Test Reports

After running tests, you can view the HTML report:
```bash
npx playwright show-report
```

## Environment Setup

The tests are configured to run against the Conduit API endpoint. No additional environment setup is required as the base URL is hardcoded in the test files.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE). 