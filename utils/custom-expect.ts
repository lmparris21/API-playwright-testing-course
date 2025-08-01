/**
 * Custom Expect Matchers Module
 * 
 * This module extends Playwright's built-in expect functionality with custom matchers
 * specifically designed for API testing. These enhanced assertions provide better
 * debugging capabilities by including API activity logs in error messages.
 * 
 * Key Features:
 * - JSON Schema validation with automatic generation
 * - Enhanced error reporting with API request/response context
 * - Integration with the logging system for debugging
 * - Type-safe custom matchers with proper TypeScript support
 * - Seamless integration with existing Playwright assertions
 * 
 * Custom Matchers Provided:
 * - shouldMatchSchema(): Validates API responses against JSON schemas
 * - shouldEqual(): Enhanced equality assertion with API logs
 * - shouldBeLessThanOrEqual(): Enhanced comparison with API logs
 * 
 * Usage:
 * await expect(response).shouldMatchSchema('articles', 'GET_articles')
 * expect(response.status).shouldEqual(200)
 * expect(response.data.length).shouldBeLessThanOrEqual(10)
 * 
 * Error Enhancement:
 * All custom matchers automatically include recent API activity in error messages,
 * providing comprehensive context for debugging test failures.
 */

import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';
import { validateSchema } from './schema-validator';

/* Global logger instance shared across all custom expect operations */
let apiLogger: APILogger

/**
 * Sets the APILogger instance to be used by custom expect matchers.
 * This function is called during fixture setup to establish the connection
 * between the logger and assertion system.
 * 
 * @param logger - APILogger instance from the current test context
 * 
 * Integration:
 * This is called automatically in fixtures.ts when setting up the API fixture,
 * ensuring that all assertions have access to the request/response logs.
 */
export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger
}

/**
 * TypeScript Declaration Merging
 * 
 * This extends Playwright's built-in Matchers interface to include our custom
 * matcher methods. This provides full type safety and IntelliSense support
 * when using custom matchers in tests.
 * 
 * The global namespace declaration merges with Playwright's existing types,
 * making the custom matchers appear as if they're built-in functionality.
 */
declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T>{
            /* Enhanced equality matcher with API logging context */
            shouldEqual(expected: T): R
            
            /* Enhanced comparison matcher with API logging context */
            shouldBeLessThanOrEqual(expected: T): R
            
            /* JSON schema validation matcher with optional schema generation */
            shouldMatchSchema(dirName: string, fileName: string, createSchemaFlag?: boolean): Promise<R>
        }
    }
}

/**
 * Extended Expect Object
 * 
 * This creates a new expect function that includes all of Playwright's built-in
 * matchers plus our custom API-specific matchers. The extend() method allows
 * for seamless integration while maintaining all existing functionality.
 */
export const expect = baseExpect.extend({
    /**
     * Schema Validation Matcher
     * 
     * Validates API response data against a JSON schema file. Optionally generates
     * a new schema from the response if one doesn't exist or if explicitly requested.
     * 
     * @param received - The API response object to validate
     * @param dirName - Directory name under response-schemas (e.g., 'articles')
     * @param fileName - Schema file name without extension (e.g., 'GET_articles')
     * @param createSchemaFlag - If true, generates schema from response before validation
     * @returns Promise<MatcherResult> - Playwright matcher result object
     * 
     * Schema File Path: ./response-schemas/{dirName}/{fileName}_schema.json
     * 
     * Features:
     * - Automatic schema generation for new endpoints
     * - Comprehensive validation error reporting
     * - API activity logs included in validation failures
     * - Integration with AJV validator for robust schema checking
     * 
     * Usage Examples:
     * await expect(response).shouldMatchSchema('articles', 'GET_articles') // validate only
     * await expect(response).shouldMatchSchema('articles', 'POST_articles', true) // generate + validate
     */
    async shouldMatchSchema(received: any, dirName: string, fileName: string, createSchemaFlag: boolean = false) {
        let pass: boolean;
        let message: string = ''
        
        try {
            /* Perform schema validation using the schema-validator module */
            await validateSchema(dirName, fileName, received, createSchemaFlag)
            pass = true;
            message = 'Schema validation passed'
        } catch (e: any) {
            /* Schema validation failed - include API logs for debugging context */
            pass = false;
            const logs = apiLogger.getRecentLogs()
            message = `${e.message}\n\nRecent API Activity: \n${logs}`
        }

        /* Return Playwright matcher result object */
        return {
            message: () => message,
            pass
        };
    },
    
    /**
     * Enhanced Equality Matcher
     * 
     * Performs equality comparison like Playwright's built-in toEqual() but includes
     * recent API activity logs in error messages for better debugging context.
     * 
     * @param received - The actual value received
     * @param expected - The expected value for comparison
     * @returns MatcherResult - Playwright matcher result with enhanced error reporting
     * 
     * Benefits over standard toEqual():
     * - API request/response logs in error messages
     * - Same assertion logic as Playwright's built-in matcher
     * - Consistent error formatting with API testing context
     * - Proper negation support (.not.shouldEqual)
     * 
     * Usage:
     * expect(response.status).shouldEqual(200)
     * expect(response.articles.length).not.shouldEqual(0)
     */
    shouldEqual(received: any, expected: any) {
        let pass: boolean;
        let logs: string = ''

        try {
            /* Use Playwright's built-in equality logic for consistency */
            baseExpect(received).toEqual(expected);
            pass = true;
            if (this.isNot) {
                /* Include logs for negated assertions that unexpectedly pass */
                logs = apiLogger.getRecentLogs()
            }
        } catch (e: any) {
            /* Assertion failed - get API logs for debugging context */
            pass = false;
            logs = apiLogger.getRecentLogs()
        }

        /* Format error message with Playwright's standard formatting plus API logs */
        const hint = this.isNot ? 'not' : ''
        const message = this.utils.matcherHint('shouldEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`

        return {
            message: () => message,
            pass
        };
    },
    
    /**
     * Enhanced Less Than or Equal Matcher
     * 
     * Performs numerical comparison like Playwright's built-in toBeLessThanOrEqual()
     * but includes recent API activity logs for debugging failed comparisons.
     * 
     * @param received - The actual numerical value
     * @param expected - The expected maximum value
     * @returns MatcherResult - Playwright matcher result with API context
     * 
     * Common Use Cases:
     * - Validating response pagination limits
     * - Checking response timing constraints
     * - Verifying data count boundaries
     * - Testing rate limiting responses
     * 
     * Usage:
     * expect(response.articles.length).shouldBeLessThanOrEqual(10)
     * expect(response.totalCount).shouldBeLessThanOrEqual(100)
     */
    shouldBeLessThanOrEqual(received: any, expected: any) {
        let pass: boolean;
        let logs: string = ''

        try {
            /* Use Playwright's built-in comparison logic */
            baseExpect(received).toBeLessThanOrEqual(expected);
            pass = true;
            if (this.isNot) {
                /* Include logs for negated assertions that unexpectedly pass */
                logs = apiLogger.getRecentLogs()
            }
        } catch (e: any) {
            /* Comparison failed - get API logs for debugging */
            pass = false;
            logs = apiLogger.getRecentLogs()
        }

        /* Format error message with comparison details and API activity */
        const hint = this.isNot ? 'not' : ''
        const message = this.utils.matcherHint('shouldBeLessThanOrEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`

        return {
            message: () => message,
            pass
        };
    }
})