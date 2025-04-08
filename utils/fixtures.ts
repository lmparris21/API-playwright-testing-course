import { test as base } from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";
import { APILogger } from "./logger";

/**
 * Custom fixture type for API testing
 * Extends Playwright's base test fixtures with API handling capabilities
 */
export type TestFixtures = {
  api: RequestHandler;
};

/**
 * Extended test fixture that provides an API request handler
 * Automatically configures:
 * - Request handler with base URL
 * - API logger for request/response tracking
 */
export const test = base.extend<TestFixtures>({
  /* Define the 'api' fixture that will be available in all tests */
  api: async ({request}, use) => {
    /* Configure base URL for all API requests */
    const baseUrl = 'https://conduit-api.bondaracademy.com/api';
    
    /* Create and initialize the logger for request/response tracking */
    const logger = new APILogger();
    
    /* Create and initialize the request handler with logger integration */
    const requestHandler = new RequestHandler(request, baseUrl, logger);
    
    /* Make the handler available to tests */
    await use(requestHandler);
  },
});
