import { RequestHandler } from "../utils/request-handler";
import { config } from "../api-test.config";
import { APILogger } from "../utils/logger";
import { request } from "@playwright/test";

/**
 * Creates an authentication token by logging in a user with email and password.
 * This function makes a POST request to the login endpoint and returns the token
 * that can be used for authenticated API requests.
 * 
 * @param email - The user's email address for authentication
 * @param password - The user's password for authentication
 * @returns Promise<string> - The authentication token prefixed with 'Token '
 * @throws Error - Throws an error if login fails or request is unsuccessful
 */
export async function createToken(email: string, password: string) {
    /* Create a new request context for this authentication request */
    const context = await request.newContext()
    
    /* Initialize logger for tracking API requests */
    const logger = new APILogger()
    
    /* Create request handler instance with context, base URL, and logger */
    const api = new RequestHandler(context, config.apiUrl, logger)

    try {
        /* Make POST request to login endpoint with user credentials */
        const tokenResponse = await api
        .path('/users/login')  /* Set the login endpoint path */
        .body({ "user": { "email": email, "password": password } })  /* Send credentials in request body */
        .postRequest(200)  /* Execute POST request expecting 200 status code */
    
    /* Return the token with 'Token ' prefix for authorization headers */
    return 'Token ' + tokenResponse.user.token
    } catch(error) {
        /* Capture stack trace for better error debugging */
        Error.captureStackTrace(error, createToken)
        throw error
    } finally {
        /* Always dispose of the request context to free up resources */
        await context.dispose()
    }
    
}