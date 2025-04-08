import { test as base } from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";

/**
 * Custom fixture type for API testing
 * Extends Playwright's base test fixtures
 */
export type TestFixtures = {
  api: RequestHandler;
};

/**
 * Extended test fixture that provides an API request handler
 * Automatically configures the request handler with base URL
 */
export const test = base.extend<TestFixtures>({
  // Define the 'api' fixture that will be available in all tests
  api: async ({request}, use) => {
    // Configure base URL for all API requests
    const baseUrl = 'https://conduit-api.bondaracademy.com/api';
    // Create and initialize the request handler
    const requestHandler = new RequestHandler(request, baseUrl);
    // Make the handler available to tests
    await use(requestHandler);
  },
});
