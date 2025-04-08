/**
 * Logger class for API requests and responses
 * Maintains a history of recent API interactions
 */
export class APILogger {
    /** Stores recent request and response logs */
    private recentLogs: any[] = [];

    /**
     * Log details of an API request
     * @param method - HTTP method (GET, POST, etc.)
     * @param url - Full request URL
     * @param headers - Request headers
     * @param body - Optional request body
     */
    logRequest(method: string, url: string, headers: Record<string, string>, body?: any) {
        const logEntry = { method, url, headers, body };
        this.recentLogs.push({type: 'Request Details', data: logEntry});
    }

    /**
     * Log details of an API response
     * @param status - HTTP status code
     * @param body - Optional response body
     */
    logResponse(status: number, body?: any) {
        const logEntry = { status, body };
        this.recentLogs.push({type: 'Response Details', data: logEntry});
    }

    /**
     * Retrieve formatted log history
     * @returns Formatted string of all recent logs
     */
    getRecentLogs() {
        const logs = this.recentLogs.map(log => {
            return `========== ${log.type} ==========\n${JSON.stringify(log.data, null, 4)}`;
        }).join('\n\n');
        return logs;
    }    
}