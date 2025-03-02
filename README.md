# API Testing with Playwright

This project demonstrates API testing using Playwright Test, focusing on testing REST API endpoints of the Conduit API.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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