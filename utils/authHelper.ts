import { Page, request, APIRequestContext } from "@playwright/test";
import { getAPIUrl, API_ENDPOINTS } from "../config/urls";

/**
 * Authentication Helper
 * Provides API-based authentication to speed up tests that don't need to test the login UI
 */

// Type definitions
type LoginResponse = {
    success: boolean;
    token: string;
    user: {
        id: number;
        email: string;
    };
};

type AuthState = {
    token: string;
    user: {
        id: number;
        email: string;
    };
};

/**
 * Login via API and return authentication token
 * @param email - User email
 * @param password - User password
 * @returns Authentication token and user info
 */
export async function loginViaAPI(email: string, password: string): Promise<AuthState> {
    // Create API request context
    const apiContext: APIRequestContext = await request.newContext();

    try {
        // Make POST request to login endpoint
        const response = await apiContext.post(
            getAPIUrl(API_ENDPOINTS.LOGIN),
            {
                data: {
                    email: email,
                    password: password
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        // Check if request was successful
        if (!response.ok()) {
            throw new Error(`Login API failed with status ${response.status()}: ${await response.text()}`);
        }

        // Parse response
        const responseBody: LoginResponse = await response.json();

        if (!responseBody.success) {
            throw new Error("Login failed: API returned success: false");
        }

        // Return auth state
        return {
            token: responseBody.token,
            user: responseBody.user
        };

    } catch (error) {
        console.error("Error during API login:", error);
        throw error;
    } finally {
        // Clean up API context
        await apiContext.dispose();
    }
}

/**
 * Set authentication token in browser storage
 * @param page - Playwright page object
 * @param token - JWT token to set
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
    // Navigate to the domain first (required to set localStorage)
      await page.context().addInitScript((authToken) => {
        localStorage.setItem("eventhub_token", authToken);
    }, token);

    console.log("Token is: " + token);
    await page.reload(); // Reload to ensure token is applied for subsequent requests
    await page.waitForLoadState("networkidle"); // Wait for any network activity to finish after reload

    console.log("✓ Authentication token set in browser storage");
}

/**
 * Complete API login and set token in browser
 * Convenience method that combines loginViaAPI and setAuthToken
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 * @returns Authentication state
 */
export async function authenticateViaAPI(page: Page, email: string, password: string): Promise<AuthState> {
    // Login via API to get token
    const authState = await loginViaAPI(email, password);

    // Set token in browser
    await setAuthToken(page, authState.token);

    console.log(`✓ Authenticated as: ${authState.user.email} (ID: ${authState.user.id})`);

    return authState;
}

/**
 * Clear authentication from browser
 * @param page - Playwright page object
 */
export async function clearAuth(page: Page): Promise<void> {
    await page.evaluate(() => {
        localStorage.removeItem("token");
        sessionStorage.clear();
    });

    console.log("✓ Authentication cleared");
}

/**
 * Check if user is authenticated
 * @param page - Playwright page object
 * @returns true if token exists in storage
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
    const token = await page.evaluate(() => {
        return localStorage.getItem("token");
    });

    return !!token;
}

/**
 * Get current auth token from browser storage
 * @param page - Playwright page object
 * @returns Token string or null if not authenticated
 */
export async function getAuthToken(page: Page): Promise<string | null> {
    return await page.evaluate(() => {
        return localStorage.getItem("token");
    });
}
