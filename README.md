# 🎭 Playwright API Testing Framework

A comprehensive, production-ready framework for API test automation using Playwright, featuring advanced logging, schema validation, multi-environment support, and fluent API design.

## 🚀 Features

### ✨ **Core Capabilities**
- **Fluent API Design** - Chainable method syntax for readable tests
- **Multi-Environment Support** - Easy switching between dev, qa, and production
- **Automatic Schema Validation** - JSON schema generation and validation
- **Enhanced Error Reporting** - Detailed logs with API activity context
- **Authentication Management** - Automatic token handling and injection
- **Comprehensive Logging** - Request/response tracking for debugging
- **Type Safety** - Full TypeScript implementation
- **Custom Assertions** - Extended expect matchers with API context

### 🏗️ **Architecture Highlights**
- **Worker-scoped Authentication** - Efficient token sharing across tests
- **Automatic Cleanup** - Prevents state leakage between tests
- **Modular Design** - Clean separation of concerns
- **Extensible Structure** - Easy to add new endpoints and features

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-api-testing-framework

# Install dependencies
npm install

# Install Playwright browsers (if needed)
npx playwright install
```

## 🏃‍♂️ Quick Start

### Basic Test Execution
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run smoke tests only
npm run test:smoke
```

### Environment-Specific Testing
```bash
# Run tests against different environments
TEST_ENV=qa npm test
TEST_ENV=prod npm test
TEST_ENV=dev npm test  # default
```

## 🎯 Usage Examples

### Simple API Test
```typescript
import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';

test('Get Articles', async ({ api }) => {
    const response = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    
    await expect(response).shouldMatchSchema('articles', 'GET_articles');
    expect(response.articles.length).shouldBeLessThanOrEqual(10);
});
```

### CRUD Operations with Authentication
```typescript
test('Create and Update Article', async ({ api }) => {
    // Create article
    const createResponse = await api
        .path('/articles')
        .body({ 
            article: { 
                title: "Test Article", 
                description: "Test Description", 
                body: "Test Content",
                tagList: ["test"] 
            } 
        })
        .postRequest(201);
    
    const slug = createResponse.article.slug;
    
    // Update article
    const updateResponse = await api
        .path(`/articles/${slug}`)
        .body({ 
            article: { 
                title: "Updated Article",
                description: "Updated Description"
            } 
        })
        .putRequest(200);
    
    await expect(updateResponse).shouldMatchSchema('articles', 'PUT_articles');
    expect(updateResponse.article.title).shouldEqual('Updated Article');
    
    // Cleanup
    await api.path(`/articles/${slug}`).deleteRequest(204);
});
```

### Public Endpoint (No Authentication)
```typescript
test('Get Tags', async ({ api }) => {
    const response = await api
        .path('/tags')
        .clearAuth()  // Remove authentication for public endpoint
        .getRequest(200);
    
    await expect(response).shouldMatchSchema('tags', 'GET_tags');
});
```

## 🔧 Configuration

### Environment Configuration (`api-test.config.ts`)
```typescript
const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'your-email@test.com',
    userPassword: 'your-password'
}

// Environment-specific overrides
if(env === 'qa') {
    config.userEmail = 'qa-user@test.com'
    config.userPassword = 'qa-password'
}
```

### Playwright Configuration
- **Test Directory**: `./tests`
- **Parallel Execution**: Configurable
- **Retries**: Configurable per environment
- **Reporters**: HTML and list reporters
- **Projects**: Separate configs for different test suites

## 📋 Schema Validation

### Automatic Schema Generation
The framework can automatically generate JSON schemas from API responses:

```typescript
// Generate schema on first run
await expect(response).shouldMatchSchema('articles', 'GET_articles', true);

// Validate against existing schema
await expect(response).shouldMatchSchema('articles', 'GET_articles');
```

### Schema Structure
```
response-schemas/
├── articles/
│   ├── GET_articles_schema.json
│   ├── POST_articles_schema.json
│   └── PUT_articles_schema.json
└── tags/
    └── GET_tags_schema.json
```

## 🛠️ API Reference

### RequestHandler Methods
```typescript
// URL and path configuration
api.url('https://custom-api.com')     // Override base URL
api.path('/articles')                 // Set endpoint path

// Parameters and headers
api.params({ limit: 10, offset: 0 }) // Query parameters
api.headers({ 'Custom': 'value' })    // Custom headers

// Request body and authentication
api.body({ article: {...} })          // Request body
api.clearAuth()                       // Remove authentication

// HTTP methods
api.getRequest(200)                   // GET request expecting 200
api.postRequest(201)                  // POST request expecting 201
api.putRequest(200)                   // PUT request expecting 200
api.deleteRequest(204)                // DELETE request expecting 204
```

### Custom Assertions
```typescript
// Enhanced equality with API logging
expect(value).shouldEqual(expected)

// Numerical comparisons with context
expect(value).shouldBeLessThanOrEqual(expected)

// Schema validation
await expect(response).shouldMatchSchema('directory', 'filename')
```

## 📁 Project Structure

```
📦 API-testing-course/
├── 🔧 Configuration
│   ├── api-test.config.ts           # API and environment configuration
│   ├── playwright.config.ts         # Playwright test runner configuration
│   └── package.json                 # Dependencies and scripts
├── 🏗️ Helpers
│   └── createToken.ts               # Authentication token generation
├── 🛠️ Utils
│   ├── custom-expect.ts             # Enhanced assertion matchers
│   ├── data-generator.ts            # Randomized test data (Faker)
│   ├── fixtures.ts                  # Test fixtures and dependency injection
│   ├── logger.ts                    # Request/response logging
│   ├── request-handler.ts           # Core API request handling
│   └── schema-validator.ts          # JSON schema validation helpers
├── 📄 Request Objects
│   └── articles/
│       └── POST-article.json        # Base payload template for article creation
├── 📋 Response Schemas
│   ├── articles/
│   │   ├── GET_articles_schema.json
│   │   ├── POST_articles_schema.json
│   │   └── PUT_articles_schema.json
│   └── tags/
│       └── GET_tags_schema.json
├── 🧪 Tests
│   ├── initialTests.spec.ts         # Basic Playwright API tests
│   ├── negativeTests.spec.ts        # Negative validation scenarios
│   └── smokeTest.spec.ts            # Core endpoint smoke coverage
├── 📊 Reports
│   ├── playwright-report/           # HTML test reports
│   └── test-results/                # Test execution artifacts
└── readme.md
```

## 🎓 Learning Resources

This framework is part of the **"Playwright API Testing Mastery"** course at Bondar Academy, which provides:
- Step-by-step implementation guidance
- Detailed explanations of framework components
- Best practices for API test automation
- Advanced Playwright techniques

[![Playwright API Testing Mastery](https://img.shields.io/badge/Playwright_API_Testing_Mastery-blue?style=for-the-badge)](https://www.bondaracademy.com/course/playwright-api-testing-mastery?utm_source=github&utm_medium=readme)

## 🔄 Advanced Features

### Custom Authentication
```typescript
// Use different user credentials
const customToken = await createToken('custom@email.com', 'password');
await api.headers({ 'Authorization': customToken }).getRequest(200);
```

### Environment Variables
```bash
# Set custom environment
export TEST_ENV=staging

# Run specific test file
npx playwright test tests/smokeTest.spec.ts

# Run with custom environment
TEST_ENV=qa npx playwright test tests/smokeTest.spec.ts
```

### Logging and Debugging
```typescript
// Access recent API activity in tests
const logger = new APILogger();
logger.logRequest('GET', '/api/articles', headers);
logger.logResponse(200, responseBody);
console.log(logger.getRecentLogs());
```

## 🚦 Test Execution

### Available Scripts
```bash
npm test                    # Run all tests
npm run test:ui            # Run with Playwright UI mode
npm run test:smoke         # Run smoke tests only
```

### Test Projects
- **api-testing**: Main test suite
- **smoke-tests**: Critical path validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🔗 API Documentation

This framework tests the **Conduit API** (RealWorld example app):
- Articles CRUD operations
- User authentication
- Tags management
- Comments and favorites (extensible)

---

**Built with ❤️ using Playwright and TypeScript**

