/**
 * Negative tests for user creation username validation
 *
 * Purpose:
 * - Verify backend validation rules for `username` length on user registration
 * - Ensure boundary lengths (3 and 20) are accepted, other invalid lengths return proper messages
 *
 * Notes:
 * - Uses the shared `api` fixture to build and send HTTP requests
 * - Uses custom expect helpers from `../utils/custom-expect`
 */
import { test } from "../../utils/fixtures";
import { expect } from "../../utils/custom-expect";

/**
 * Test matrix
 * - username: candidate input for registration
 * - usernameErrorMessage: expected validation message. Empty string => no username error expected
 */
[
    { username: "dd", usernameErrorMessage: "is too short (minimum is 3 characters)" },
    { username: "ddd", usernameErrorMessage: "" },
    { username: "dddddddddddddddddddd", usernameErrorMessage: "" },
    { username: "ddddddddddddddddddddd", usernameErrorMessage: "is too long (maximum is 20 characters)" },
].forEach(({ username, usernameErrorMessage }) => {
    test(`Create User Error message validation for username ${username}`, async ({ api }) => {
        /**
         * Send POST /users with minimal invalid email/password; vary only the username
         * Clear auth to simulate anonymous user registration
         * Expect 422 Unprocessable Entity for invalid payloads
         */
        const newUserResponse = await api
            .path("/users")
            .body({
                "user": {
                    "email": "d",
                    "password": "d",
                    "username": username
                }
            })
            .clearAuth()
            .postRequest(422);

        /**
         * Boundary rule:
         * - length 3 or 20 => valid; response should NOT include a username error
         * - otherwise => expect the first username error message to match the matrix
         */
        if(username.length ==3 || username.length == 20) {
            expect(newUserResponse.errors).not.toHaveProperty('username')
        } else {    
            expect(newUserResponse.errors.username[0]).shouldEqual(usernameErrorMessage)
        }
    })
});

