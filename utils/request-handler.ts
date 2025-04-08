import { APIRequestContext } from "@playwright/test";
import { test, expect } from '@playwright/test';

/**
 * Handles API requests with a fluent builder pattern
 * Allows chaining of request configuration methods
 */
export class RequestHandler {
  private request: APIRequestContext;
  private baseUrl: string;
  private defaultBaseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiHeaders: Record<string, string> = {};
  private apiBody: object = {};

  /**
   * @param request - Playwright's API request context
   * @param apiBaseUrl - Default base URL for all requests
   */
  constructor(request: APIRequestContext, apiBaseUrl: string) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
  }

  /**
   * Override the default base URL for this request
   */
  url(url: string) {
    this.baseUrl = url;
    return this;
  }

  /**
   * Set the API endpoint path
   */
  path(path: string) {
    this.apiPath = path;
    return this;
  }

  /**
   * Add query parameters to the request
   */
  params(params: object) {
    this.queryParams = params;
    return this;
  }

  /**
   * Set request headers
   */
  headers(headers: Record<string, string>) {
    this.apiHeaders = headers;
    return this;
  }

  /**
   * Set request body
   */
  body(body: object) {
    this.apiBody = body;
    return this;
  }

  /**
   * Send GET request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   */
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.get(url, {
      headers: this.apiHeaders
    });
    expect(response.status()).toEqual(statusCode);
    const responseJSON = await response.json();

    return responseJSON;
  }
  
  /**
   * Send POST request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   */
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.post(url, {
      headers: this.apiHeaders,
      data: this.apiBody
    });
    expect(response.status()).toEqual(statusCode);
    const responseJSON = await response.json();

    return responseJSON;
  }

  /**
   * Send PUT request and verify response status code
   * @param statusCode - Expected HTTP status code
   * @returns Parsed JSON response
   */
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.put(url, {
      headers: this.apiHeaders,
      data: this.apiBody
    });
    expect(response.status()).toEqual(statusCode);
    const responseJSON = await response.json();

    return responseJSON;
  }

  /**
   * Send DELETE request and verify response status code
   * @param statusCode - Expected HTTP status code
   */
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.delete(url, {
      headers: this.apiHeaders
    });
    expect(response.status()).toEqual(statusCode);
  }

  /**
   * Builds the complete URL with base URL, path and query parameters
   */
  private getUrl() {
    const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, value);
    }
    return url.toString();
  }
}
