/**
 * API Logger Module
 * 
 * This module provides comprehensive logging capabilities for API requests and responses
 * in the testing framework. It captures detailed information about HTTP interactions
 * and formats them for debugging and error reporting.
 * 
 * Key Features:
 * - Request/response activity tracking
 * - Structured log data storage
 * - Formatted output for debugging
 * - Integration with error reporting
 * - Recent activity retrieval for context
 * 
 * Integration Points:
 * - RequestHandler: Logs all HTTP requests/responses automatically
 * - Custom Expect: Includes API logs in assertion failure messages
 * - Error Handling: Provides context for debugging test failures
 * 
 * Usage:
 * const logger = new APILogger()
 * logger.logRequest('GET', '/api/articles', headers, body)
 * logger.logResponse(200, responseBody)
 * console.log(logger.getRecentLogs()) // Get formatted log output
 */

/**
 * APILogger Class
 * 
 * A specialized logger for capturing and formatting API request/response activity.
 * Maintains an in-memory collection of recent API interactions that can be
 * retrieved for debugging, error reporting, and test analysis.
 * 
 * Log Structure:
 * Each log entry contains:
 * - type: 'Request Details' or 'Response Details'
 * - data: Object containing the actual request/response information
 * 
 * Memory Management:
 * Logs are stored in memory for the duration of the test execution.
 * Each logger instance maintains its own log collection.
 */
export class APILogger {

    /**
     * In-memory storage for recent API activity logs.
     * Each entry contains structured data about requests and responses.
     * 
     * Entry Format:
     * {
     *   type: 'Request Details' | 'Response Details',
     *   data: {
     *     // Request data: method, url, headers, body
     *     // Response data: statusCode, body
     *   }
     * }
     */
    private recentLogs: any[] = []

    /**
     * Logs details of an outgoing HTTP request.
     * Captures all relevant information needed for debugging and analysis.
     * 
     * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param url - Complete URL that was requested
     * @param headers - HTTP headers sent with the request
     * @param body - Request body data (optional, for POST/PUT requests)
     * 
     * Logged Information:
     * - HTTP method and target URL
     * - All request headers (including authentication)
     * - Request body data (if applicable)
     * 
     * Usage:
     * logger.logRequest('POST', 'https://api.example.com/articles', 
     *                   { 'Authorization': 'Bearer token' }, 
     *                   { article: { title: 'Test' } })
     */
    logRequest(method: string, url: string, headers: Record<string, string>, body?: any){
        /* Create structured log entry for the request */
        const logEntry = {method, url, headers, body}
        
        /* Add to recent logs with descriptive type identifier */
        this.recentLogs.push({type: 'Request Details', data: logEntry})
    }

    /**
     * Logs details of an HTTP response received from the API.
     * Captures response status and body data for analysis.
     * 
     * @param statusCode - HTTP status code returned by the server
     * @param body - Response body data (optional, may be empty for some responses)
     * 
     * Logged Information:
     * - HTTP status code (200, 201, 404, 500, etc.)
     * - Complete response body data
     * 
     * Usage:
     * logger.logResponse(200, { articles: [...], articlesCount: 10 })
     * logger.logResponse(204) // For responses with no body
     */
    logResponse(statusCode: number, body?: any){
        /* Create structured log entry for the response */
        const logEntry = {statusCode, body}
        
        /* Add to recent logs with descriptive type identifier */
        this.recentLogs.push({type: 'Response Details', data: logEntry})
    }

    /**
     * Retrieves and formats all recent API activity logs for display.
     * Converts the structured log data into a human-readable format
     * suitable for console output, error messages, and debugging.
     * 
     * @returns string - Formatted log output with clear section separators
     * 
     * Output Format:
     * ===Request Details===
     * {
     *   "method": "POST",
     *   "url": "https://api.example.com/articles",
     *   "headers": { ... },
     *   "body": { ... }
     * }
     * 
     * ===Response Details===
     * {
     *   "statusCode": 201,
     *   "body": { ... }
     * }
     * 
     * Integration Uses:
     * - Error messages in failed assertions
     * - Status code validation failures
     * - Test debugging and analysis
     * - Manual log inspection during development
     */
    getRecentLogs(){
        /* Transform each log entry into formatted string representation */
        const logs = this.recentLogs.map(log => {
            /* Create clear section headers and format JSON with proper indentation */
            return `===${log.type}===\n${JSON.stringify(log.data, null, 4)}`
        }).join('\n\n') /* Join all log entries with double line breaks for readability */
        
        return logs
    }

}