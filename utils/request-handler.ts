/**
 * Request Handler Module
 * 
 * This module provides a fluent API interface for making HTTP requests in Playwright tests.
 * Features include:
 * - Chainable method syntax for readable test code
 * - Automatic authentication token injection
 * - Comprehensive request/response logging
 * - Built-in status code validation
 * - Automatic cleanup to prevent state leakage
 * - Support for all HTTP methods (GET, POST, PUT, DELETE)
 * 
 * Usage Pattern:
 * const response = await api
 *   .path('/articles')
 *   .params({ limit: 10 })
 *   .headers({ 'Custom': 'value' })
 *   .body({ article: {...} })
 *   .postRequest(201)
 */

import { APIRequestContext } from "@playwright/test"
import { APILogger } from "./logger";
import { test } from "@playwright/test"

/**
 * RequestHandler Class
 * 
 * A fluent API wrapper around Playwright's APIRequestContext that provides
 * a chainable interface for building and executing HTTP requests with
 * automatic logging, authentication, and validation.
 */
export class RequestHandler {

    /* Playwright's API request context for making HTTP calls */
    private request: APIRequestContext
    
    /* Logger instance for tracking request/response activity */
    private logger: APILogger
    
    /* Override URL for specific requests (optional) */
    private baseUrl: string | undefined
    
    /* Default base URL for all requests */
    private defaultBaseUrl: string
    
    /* API endpoint path (e.g., '/articles', '/users/login') */
    private apiPath: string = ''
    
    /* Query parameters object for URL construction */
    private queryParams: object = {}
    
    /* HTTP headers for the request */
    private apiHeaders: Record<string, string> = {}
    
    /* Request body data for POST/PUT requests */
    private apiBody: object = {}
    
    /* Default authentication token to inject automatically */
    private defaultAuthToken: string
    
    /* Flag to skip authentication for public endpoints */
    private clearAuthFlag: boolean

    /**
     * Constructor for RequestHandler
     * 
     * @param request - Playwright's APIRequestContext instance
     * @param apiBaseUrl - Base URL for API requests (e.g., 'https://api.example.com')
     * @param logger - APILogger instance for request/response tracking
     * @param authToken - Default authentication token (optional)
     */
    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger, authToken: string = '') {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl
        this.logger = logger
        this.defaultAuthToken = authToken
    }

    /**
     * Sets a custom base URL for this specific request (overrides default).
     * Useful for testing different environments or external APIs.
     * 
     * @param url - Full base URL to use for this request
     * @returns this (for method chaining)
     * 
     * Example: api.url('https://staging-api.example.com').path('/articles')
     */
    url(url: string) {
        this.baseUrl = url
        return this
    }

    /**
     * Sets the API endpoint path for the request.
     * 
     * @param path - API endpoint path (e.g., '/articles', '/users/123')
     * @returns this (for method chaining)
     * 
     * Example: api.path('/articles').getRequest(200)
     */
    path(path: string) {
        this.apiPath = path
        return this
    }

    /**
     * Sets query parameters for the request URL.
     * Parameters are automatically URL-encoded and appended to the URL.
     * 
     * @param params - Object containing query parameters
     * @returns this (for method chaining)
     * 
     * Example: api.params({ limit: 10, offset: 0 }) -> URL becomes /articles?limit=10&offset=0
     */
    params(params: object) {
        this.queryParams = params
        return this
    }

    /**
     * Sets custom HTTP headers for the request.
     * Note: Authentication headers are handled automatically unless clearAuth() is called.
     * 
     * @param headers - Object containing header key-value pairs
     * @returns this (for method chaining)
     * 
     * Example: api.headers({ 'Content-Type': 'application/json', 'X-Custom': 'value' })
     */
    headers(headers: Record<string, string>) {
        this.apiHeaders = headers
        return this
    }

    /**
     * Sets the request body for POST/PUT requests.
     * The body is automatically serialized as JSON.
     * 
     * @param body - Object containing the request body data
     * @returns this (for method chaining)
     * 
     * Example: api.body({ article: { title: 'Test', description: 'Test article' } })
     */
    body(body: object) {
        this.apiBody = body
        return this
    }

    /**
     * Clears the default authentication header for this request.
     * Useful for testing public endpoints that don't require authentication.
     * 
     * @returns this (for method chaining)
     * 
     * Example: api.path('/tags').clearAuth().getRequest(200)
     */
    clearAuth() {
        this.clearAuthFlag = true
        return this
    }

    /**
     * Executes a GET request with the configured parameters.
     * Automatically logs the request/response and validates the status code.
     * 
     * @param statusCode - Expected HTTP status code (e.g., 200, 404)
     * @returns Promise<any> - The parsed JSON response body
     * @throws Error if actual status code doesn't match expected
     * 
     * Example: const articles = await api.path('/articles').getRequest(200)
     */
    async getRequest(statusCode: number) {
        let responseJSON: any

        const url = this.getUrl()
        /* Wrap in Playwright test step for better reporting and debugging */
        await test.step(`GET request to: ${url}`, async () => {
            /* Log the outgoing request details */
            this.logger.logRequest('GET', url, this.getHeaders())
            
            /* Execute the GET request */
            const response = await this.request.get(url, {
                headers: this.getHeaders()
            })
            
            /* Clean up request state to prevent leakage between requests */
            this.cleanupFields()
            
            /* Extract status code and response body */
            const actualStatus = response.status()
            responseJSON = await response.json()
    
            /* Log the response details */
            this.logger.logResponse(actualStatus, responseJSON)
            
            /* Validate that status code matches expectation */
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest)
        })

        return responseJSON
    }

    /**
     * Executes a POST request with the configured parameters and body.
     * Handles JSON serialization and error cases gracefully.
     * 
     * @param statusCode - Expected HTTP status code (e.g., 201, 400)
     * @returns Promise<any> - The parsed JSON response body
     * @throws Error if actual status code doesn't match expected
     * 
     * Example: const newArticle = await api.path('/articles').body({...}).postRequest(201)
     */
    async postRequest(statusCode: number) {
        let responseJSON: any
        
        const url = this.getUrl()
        await test.step(`POST request to: ${url}`, async () => {
            /* Log request with body data */
            this.logger.logRequest('POST', url, this.getHeaders(), this.apiBody)
            
            /* Execute POST request with JSON body */
            const response = await this.request.post(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            
            this.cleanupFields()
            const actualStatus = response.status()
            
            /* Handle cases where response body might not be valid JSON */
            try {
                responseJSON = await response.json()
            } catch (error) {
                /* Some endpoints return empty bodies or non-JSON responses */
                responseJSON = {}
            }
            
            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        })
    
        return responseJSON
    }

    /**
     * Executes a PUT request for updating resources.
     * Similar to POST but typically used for updates rather than creation.
     * 
     * @param statusCode - Expected HTTP status code (e.g., 200, 204)
     * @returns Promise<any> - The parsed JSON response body
     * @throws Error if actual status code doesn't match expected
     * 
     * Example: const updated = await api.path('/articles/123').body({...}).putRequest(200)
     */
    async putRequest(statusCode: number) {
        let responseJSON: any

        const url = this.getUrl()
        await test.step(`PUT request to: ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.getHeaders(), this.apiBody)
            
            /* Execute PUT request with JSON body */
            const response = await this.request.put(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            
            this.cleanupFields()
            const actualStatus = response.status()
            
            /* Handle potential JSON parsing errors */
            try {
                responseJSON = await response.json()
            } catch (error) {
                responseJSON = {}
            }
            
            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        })
        
        return responseJSON
    }

    /**
     * Executes a DELETE request for removing resources.
     * DELETE requests typically don't return response bodies.
     * 
     * @param statusCode - Expected HTTP status code (e.g., 204, 200)
     * @throws Error if actual status code doesn't match expected
     * 
     * Example: await api.path('/articles/123').deleteRequest(204)
     */
    async deleteRequest(statusCode: number) {
        const url = this.getUrl()
        await test.step(`DELETE request to: ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.getHeaders())
            
            /* Execute DELETE request (no body needed) */
            const response = await this.request.delete(url, {
                headers: this.getHeaders()
            })
            
            this.cleanupFields()
            const actualStatus = response.status()
            
            /* DELETE responses often have no body, so we only log status */
            this.logger.logResponse(actualStatus)
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
        })
    }

    /**
     * Constructs the full URL from base URL, path, and query parameters.
     * Handles URL encoding and parameter serialization automatically.
     * 
     * @returns string - The complete URL for the request
     * 
     * Private method used internally by request methods.
     */
    private getUrl() {
        /* Use custom URL if provided, otherwise use default base URL */
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`)
        
        /* Add query parameters to the URL */
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value)
        }
        
        return url.toString()
    }

    /**
     * Validates that the actual HTTP status code matches the expected status.
     * Throws a detailed error with recent API activity if validation fails.
     * 
     * @param actualStatus - The actual HTTP status code received
     * @param expectStatus - The expected HTTP status code
     * @param callingMethod - Reference to the calling method for stack trace
     * @throws Error with detailed context if status codes don't match
     * 
     * Private method providing centralized status validation.
     */
    private statusCodeValidator(actualStatus: number, expectStatus: number, callingMethod: Function) {
        if (actualStatus !== expectStatus) {
            /* Get recent API activity for debugging context */
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`)
            
            /* Capture proper stack trace pointing to the calling method */
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }

    /**
     * Manages authentication headers for requests.
     * 
     * Automatic Authentication Logic:
     * - If clearAuthFlag is false: Adds Authorization header
     * - Uses custom Authorization header if provided
     * - Falls back to defaultAuthToken if no custom auth header
     * - If clearAuthFlag is true: Skips authentication entirely
     * 
     * @returns Record<string, string> - Headers object with authentication
     * 
     * Private method handling authentication logic.
     * Call .clearAuth() to skip authentication for public endpoints.
     */
    private getHeaders() {
        if (!this.clearAuthFlag) {
            /* Add Authorization header if not explicitly cleared */
            this.apiHeaders['Authorization'] = this.apiHeaders['Authorization'] || this.defaultAuthToken
        }
        return this.apiHeaders
    }

    /**
     * Cleans up request state after each HTTP request.
     * This prevents state leakage between requests and ensures clean state.
     * 
     * Fields Reset:
     * - Request body data
     * - Custom headers (except defaults)
     * - Custom base URL override
     * - API path
     * - Query parameters
     * - Clear auth flag
     * 
     * Private method called automatically after each request.
     * Critical for preventing unintended parameter inheritance between requests.
     */
    private cleanupFields() {
        this.apiBody = {}
        this.apiHeaders = {}
        this.baseUrl = undefined
        this.apiPath = ''
        this.queryParams = {}
        this.clearAuthFlag = false
    }

}