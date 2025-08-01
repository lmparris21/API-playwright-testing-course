/**
 * Test Fixtures Module
 * 
 * This module extends Playwright's base test functionality with custom fixtures
 * that provide dependency injection for the API testing framework. Fixtures
 * enable clean test setup, shared resources, and automatic cleanup.
 * 
 * Playwright Fixtures Benefits:
 * - Dependency injection for test dependencies
 * - Automatic setup and teardown lifecycle management
 * - Resource sharing across tests (worker-scoped fixtures)
 * - Type-safe access to custom test utilities
 * - Clean test code without repetitive setup
 * 
 * Custom Fixtures Provided:
 * - authToken: Worker-scoped authentication token (shared across tests)
 * - api: Test-scoped RequestHandler instance with logging and auth
 * - config: Environment configuration access
 * 
 * Usage in Tests:
 * test('My API Test', async ({ api, config }) => {
 *   // api and config are automatically injected and ready to use
 *   const response = await api.path('/articles').getRequest(200)
 * })
 */

import { test as base } from '@playwright/test';
import { RequestHandler } from '../utils/request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';

/**
 * Type definition for test-scoped fixtures.
 * These fixtures are created fresh for each test and cleaned up automatically.
 * 
 * Test-Scoped Lifecycle:
 * - Created before each test execution
 * - Available throughout the test
 * - Automatically cleaned up after test completion
 * - Independent between different tests
 */
export type TestOptions = {
    /* RequestHandler instance with logging, authentication, and fluent API */
    api: RequestHandler
    
    /* Configuration object with environment-specific settings */
    config: typeof config
}

/**
 * Type definition for worker-scoped fixtures.
 * These fixtures are created once per worker process and shared across
 * all tests running in that worker.
 * 
 * Worker-Scoped Lifecycle:
 * - Created once when worker starts
 * - Shared across all tests in the worker
 * - Cleaned up when worker terminates
 * - Optimizes performance for expensive setup operations
 */
export type WorkerFixture = {
    /* Authentication token shared across all tests in worker */
    authToken: string
}

/**
 * Extended Playwright test with custom fixtures.
 * This creates a new test function that includes our custom dependencies
 * while maintaining all of Playwright's built-in functionality.
 * 
 * Fixture Dependency Graph:
 * authToken (worker) → api (test) → test execution
 *                   ↗ config (test) ↗
 * 
 * The extend() method defines how each fixture is created and what
 * dependencies it requires from other fixtures.
 */
export const test = base.extend<TestOptions, WorkerFixture>({
    /**
     * Worker-scoped authentication token fixture.
     * Creates a single authentication token that is shared across all tests
     * running in the same worker process for performance optimization.
     * 
     * Performance Benefits:
     * - Avoids repeated login requests for each test
     * - Reduces test execution time significantly
     * - Minimizes API load during test runs
     * 
     * Scope: 'worker' - Created once per worker, shared across tests
     * Dependencies: None (uses configuration directly)
     * 
     * The token is created by logging in with credentials from the config
     * and remains valid for the duration of the worker lifecycle.
     */
    authToken: [ async ({}, use) => {
        /* Create authentication token using configured user credentials */
        const authToken = await createToken(config.userEmail, config.userPassword)
        
        /* Provide the token to dependent fixtures and tests */
        await use(authToken)
    }, {scope: 'worker'}], /* Worker scope: shared across all tests in worker */

    /**
     * Test-scoped API RequestHandler fixture.
     * Creates a fresh RequestHandler instance for each test with logging,
     * authentication, and configuration properly set up.
     * 
     * Setup Process:
     * 1. Creates new APILogger instance for request/response tracking
     * 2. Configures custom expect matchers with logger integration
     * 3. Initializes RequestHandler with all dependencies
     * 4. Provides ready-to-use API client to the test
     * 
     * Dependencies:
     * - request: Playwright's built-in APIRequestContext
     * - authToken: Worker-scoped authentication token
     * 
     * Features Provided:
     * - Fluent API interface for HTTP requests
     * - Automatic authentication token injection
     * - Comprehensive request/response logging
     * - Status code validation with detailed error reporting
     */
    api: async({request, authToken}, use) => {
        /* Create logger instance for this test's API activity */
        const logger = new APILogger()
        
        /* Configure custom expect matchers to use this logger for error context */
        setCustomExpectLogger(logger)
        
        /* Create RequestHandler with all dependencies: context, base URL, logger, auth token */
        const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken)
        
        /* Provide the configured RequestHandler to the test */
        await use(requestHandler)
    },
    
    /**
     * Test-scoped configuration fixture.
     * Provides access to environment-specific configuration settings.
     * 
     * Configuration Contents:
     * - API base URL for the current environment
     * - User credentials for authentication
     * - Environment-specific overrides (dev/qa/prod)
     * 
     * Usage in Tests:
     * const { apiUrl, userEmail } = config
     * 
     * Dependencies: None (accesses global config directly)
     */
    config: async({}, use) => {
        /* Provide the configuration object to the test */
        await use(config)
    }
})