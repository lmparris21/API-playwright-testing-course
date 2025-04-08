import { APIRequestContext } from "@playwright/test";
import { test, expect } from '@playwright/test';
import { APILogger } from "./logger";

/**
 * Handles API requests with a fluent builder pattern
 * Features:
 * - Request configuration chaining
 * - Automatic request/response logging
 * - Status code validation with detailed error reporting
 */
export class RequestHandler {
  private request: APIRequestContext;
  private logger: APILogger;
  private baseUrl: string;
  private defaultBaseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiHeaders: Record<string, string> = {};
  private apiBody: object = {};

  /**
   * @param request - Playwright's API request context
   * @param apiBaseUrl - Default base URL for all requests
   * @param logger - Logger instance for request/response tracking
   */
  constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
    this.logger = logger;
  }

  /**
   * Override the default base URL for this request
   * @returns this - For method chaining
   */
  url(url: string) {
    this.baseUrl = url;
    return this;
  }

  /**
   * Set the API endpoint path
   * @returns this - For method chaining
   */
  path(path: string) {
    this.apiPath = path;
    return this;
  }

  /**
   * Add query parameters to the request
   * @returns this - For method chaining
   */
  params(params: object) {
    this.queryParams = params;
    return this;
  }

  /**
   * Set request headers
   * @returns this - For method chaining
   */
  headers(headers: Record<string, string>) {
    this.apiHeaders = headers;
    return this;
  }

  /**
   * Set request body
   * @returns this - For method chaining
   */
  body(body: object) {
    this.apiBody = body;
    return this;
  }

  /**
   * Send GET request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   * @throws Error with request/response logs if status code doesn't match
   */
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest('GET', url, this.apiHeaders);
    const response = await this.request.get(url, {
      headers: this.apiHeaders
    });
    const actualStatusCode = response.status();
    const responseJSON = await response.json();

    this.logger.logResponse(actualStatusCode, responseJSON);
    this.statusCodeValidator(actualStatusCode, statusCode, this.getRequest);
    
    return responseJSON;
  }
  
  /**
   * Send POST request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   * @throws Error with request/response logs if status code doesn't match
   */
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody);
    const response = await this.request.post(url, {
      headers: this.apiHeaders,
      data: this.apiBody
    });
    const actualStatusCode = response.status();
    const responseJSON = await response.json();

    this.logger.logResponse(actualStatusCode, responseJSON);  
    this.statusCodeValidator(actualStatusCode, statusCode, this.postRequest);

    return responseJSON;
  }

  /**
   * Send PUT request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   * @throws Error with request/response logs if status code doesn't match
   */
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody);
    const response = await this.request.put(url, {
      headers: this.apiHeaders,
      data: this.apiBody
    });
    const actualStatusCode = response.status();
    const responseJSON = await response.json();

    this.logger.logResponse(actualStatusCode, responseJSON);
    this.statusCodeValidator(actualStatusCode, statusCode, this.putRequest);

    return responseJSON;
  }

  /**
   * Send DELETE request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @throws Error with request/response logs if status code doesn't match
   */
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest('DELETE', url, this.apiHeaders);
    const response = await this.request.delete(url, {
      headers: this.apiHeaders
    });
    const actualStatusCode = response.status();
    this.logger.logResponse(actualStatusCode);
    this.statusCodeValidator(actualStatusCode, statusCode, this.deleteRequest);
  }

  /**
   * Builds the complete URL with base URL, path and query parameters
   * @returns Fully formed URL string
   * @private
   */
  private getUrl() {
    const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, value);
    }
    return url.toString();
  }

  /**
   * Validates response status code and throws detailed error if mismatch
   * @param actualStatusCode - Received HTTP status code
   * @param expectedStatusCode - Expected HTTP status code
   * @param callingMethod - Method reference for stack trace
   * @throws Error with request/response logs if status codes don't match
   * @private
   */
  private statusCodeValidator(actualStatusCode: number, expectedStatusCode: number, callingMethod: Function) {
    if (actualStatusCode !== expectedStatusCode) {
      const logs = this.logger.getRecentLogs();
      const error = new Error(`Expected status code ${expectedStatusCode}, but got ${actualStatusCode}\n\nRecent API Activity: \n${logs}`);
      Error.captureStackTrace(error, callingMethod);
      throw error;
    }
  }
}
