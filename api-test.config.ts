/**
 * API Test Configuration
 * 
 * This configuration file manages environment-specific settings for the API testing framework.
 * It supports multiple environments (dev, qa, prod) with different API URLs and user credentials.
 * 
 * Environment Selection:
 * - Default: 'dev' environment
 * - Override: Set TEST_ENV environment variable
 * 
 * Usage Examples:
 * - Default (dev): npm test
 * - QA environment: TEST_ENV=qa npm test
 * - Production: TEST_ENV=prod npm test
 */

/* Get environment from process.env.TEST_ENV or default to 'dev' */
const processENV = process.env.TEST_ENV
const env = processENV || 'dev'
console.log('Test environment is: ' + env)

/**
 * Default configuration object containing API URL and user credentials.
 * These values are used for the 'dev' environment by default.
 */
const config = {
    /* Base API URL for the Conduit API - dev environment */
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    
    /* Test user email for authentication - dev environment */
    userEmail: 'lmparris21@test.com',
    
    /* Test user password for authentication - dev environment */
    userPassword: 'apitesting123!'
}

/**
 * Environment-specific configuration overrides
 * These conditional blocks modify the config object based on the selected environment
 */

/* QA Environment Configuration */
if(env === 'qa'){
    config.userEmail = 'pwapiuser@test.com',
    config.userPassword = 'Welcome'
}

/* Production Environment Configuration */
if(env === 'prod'){
    config.userEmail = 'pwtest@test.com',
    config.userPassword = 'Welcome2'
}

/* Export the configuration object for use throughout the framework */
export {config}

/**
 * Environment Usage Instructions:
 * 
 * To use a different environment, set the TEST_ENV variable before running tests:
 * 
 * QA Environment:
 * TEST_ENV=qa npx playwright test tests/smokeTest.spec.ts
 * 
 * Production Environment:  
 * TEST_ENV=prod npx playwright test tests/smokeTest.spec.ts
 * 
 * You can also export the variable for the entire session:
 * export TEST_ENV=qa
 * npm test
 * 
 * Configuration Access:
 * - Import: import { config } from '../api-test.config'
 * - Usage: config.apiUrl, config.userEmail, config.userPassword
 */