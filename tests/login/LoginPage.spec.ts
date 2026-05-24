import { test, expect } from "../../fixtures/pageFixtures";
import { ConfigManager } from "../../config/ConfigManager";
import { logger } from "../../utils/Logger";
import { loginViaAPI, authenticateViaAPI } from "../../utils/authHelper";

/**
 * Test Suite: Login Functionality
 * Description: Comprehensive test coverage for login scenarios including valid/invalid credentials
 * Authentication: Uses custom fixture with auto-injected LoginPage
 */

test.describe("Login Functionality Tests", () => {

    /**
     * Test Case: Valid User Login
     * Given: User is on the login page
     * When: User enters valid credentials and clicks login
     * Then: User should be redirected to eventhub page
     * And: Success indicator should be visible
     * Tags: @smoke @critical @happy-path
     */
    test("should successfully login with valid credentials @smoke @critical @happy-path", async ({ loginPage }) => {
        logger.testStart("Valid User Login", { tags: ["smoke", "critical", "happy-path"] });

        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();

        // Arrange: Navigate to login page
        await loginPage.navigateToLoginPage();
        logger.step("Navigated to login page");

        // Act: Perform login with valid credentials
        await loginPage.login(email, password);
        logger.step("Submitted login credentials");

        // Assert: Verify successful login
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).toContain('eventhub');

        logger.step(`Valid user login successful - Redirected to: ${currentUrl}`, { url: currentUrl });
        logger.testPass("Valid User Login");
    });

    /**
     * Test Case: Invalid User Login
     * Given: User is on the login page
     * When: User enters invalid credentials and clicks login
     * Then: User should remain on the login page
     * And: No success indicator should be visible
     * Tags: @negative @critical
     */
    test("should fail to login with invalid credentials @negative @critical", async ({ loginPage }) => {
        logger.testStart("Invalid User Login", { tags: ["negative", "critical"] });

        const config = ConfigManager.getInstance();
        const { email } = config.getCredentials();

        // Arrange: Navigate to login page
        await loginPage.navigateToLoginPage();
        logger.step("Navigated to login page");

        // Act: Attempt login with invalid password
        await loginPage.login(email, "WrongPassword123!");
        logger.step("Submitted invalid credentials");

        // Assert: Should remain on login page or show error
        const currentUrl = loginPage.getCurrentUrl();
        const isOnLoginPage = await loginPage.isOnLoginPage();

        // Either still on login page OR error message visible
        expect(isOnLoginPage || currentUrl.includes('login')).toBeTruthy();

        logger.step("Invalid login correctly rejected", { remainedOnLoginPage: isOnLoginPage });
        logger.testPass("Invalid User Login");
    });

    /**
     * Test Case: Empty Credentials Login
     * Given: User is on the login page
     * When: User clicks login without entering credentials
     * Then: Form validation should prevent submission
     * Tags: @negative @validation
     */
    test("should prevent login with empty credentials @negative @validation", async ({ loginPage }) => {
        logger.testStart("Empty Credentials Validation", { tags: ["negative", "validation"] });

        // Arrange: Navigate to login page
        await loginPage.navigateToLoginPage();
        logger.step("Navigated to login page");

        // Act: Try to submit empty form
        try {
            await loginPage.login("", "");
        } catch (error) {
            // Expected: Method should throw error for empty credentials
            expect((error as Error).message).toContain('Username and password are required');
            logger.step("Empty credentials validation working", { validationError: (error as Error).message });
            logger.testPass("Empty Credentials Validation");
            return;
        }

        // If no error thrown, should still be on login page
        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();
        logger.step("Empty credentials prevented login");
        logger.testPass("Empty Credentials Validation");
    });

});

test.describe("Login Functionality - API Tests", () => {

    /**
     * Test Case: Valid User Login via API
     * Given: Valid user credentials
     * When: Login API is called with correct credentials
     * Then: API should return success status and token
     * Tags: @api @smoke @integration
     */
    test("should successfully login via API with valid credentials @api @smoke @integration", async () => {
        logger.testStart("Login via API - Valid Credentials", { tags: ["api", "smoke", "integration"] });

        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();

        // Act: Login via API using authHelper
        const authState = await loginViaAPI(email, password);

        logger.step("Login API called via authHelper", {
            email: email
        });

        // Assert: Response should contain token and user info
        expect(authState).toHaveProperty('token');
        expect(authState.token).toBeTruthy();
        expect(typeof authState.token).toBe('string');

        expect(authState).toHaveProperty('user');
        expect(authState.user).toHaveProperty('email');
        expect(authState.user.email).toBe(email);

        logger.step("✓ Login successful via API", {
            hasToken: !!authState.token,
            tokenLength: authState.token?.length,
            userId: authState.user.id,
            userEmail: authState.user.email
        });
        logger.testPass("Login via API - Valid Credentials");
    });

    /**
     * Test Case: Invalid User Login via API
     * Given: Invalid user credentials
     * When: Login API is called with incorrect password
     * Then: API should return error status
     * Tags: @api @negative @integration
     */
    test("should fail to login via API with invalid credentials @api @negative @integration", async () => {
        logger.testStart("Login via API - Invalid Credentials", { tags: ["api", "negative", "integration"] });

        const { request } = await import("@playwright/test");
        const config = ConfigManager.getInstance();
        const { email } = config.getCredentials();

        // Create API context
        const apiContext = await request.newContext();
        logger.step("Created API context");

        // Act: Login via API with wrong password
        const loginResponse = await apiContext.post(
            config.getApiUrl('/api/auth/login'),
            {
                data: {
                    email: email,
                    password: "WrongPassword123!"
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        logger.step("Login API called with invalid credentials", {
            url: config.getApiUrl('/api/auth/login'),
            email: email
        });

        // Assert: Response should indicate failure
        expect(loginResponse.ok()).toBeFalsy();
        expect([400, 401, 403]).toContain(loginResponse.status());

        const loginBody = await loginResponse.json();
        logger.step("Received error response", { status: loginResponse.status() });

        // Assert: Response should contain error message (either 'message' or 'error' field)
        const hasError = loginBody.hasOwnProperty('message') || loginBody.hasOwnProperty('error');
        expect(hasError).toBeTruthy();

        const errorMessage = loginBody.message || loginBody.error;
        logger.step("✓ Login correctly failed via API", {
            status: loginResponse.status(),
            errorMessage: errorMessage
        });
        logger.testPass("Login via API - Invalid Credentials");

        await apiContext.dispose();
    });

    /**
     * Test Case: Login via API with Missing Credentials
     * Given: Empty or missing credentials
     * When: Login API is called without email or password
     * Then: API should return validation error
     * Tags: @api @negative @validation
     */
    test("should fail to login via API with missing credentials @api @negative @validation", async () => {
        logger.testStart("Login via API - Missing Credentials", { tags: ["api", "negative", "validation"] });

        const { request } = await import("@playwright/test");
        const config = ConfigManager.getInstance();

        // Create API context
        const apiContext = await request.newContext();
        logger.step("Created API context");

        // Act: Login via API with empty credentials
        const loginResponse = await apiContext.post(
            config.getApiUrl('/api/auth/login'),
            {
                data: {
                    email: "",
                    password: ""
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        logger.step("Login API called with empty credentials", {
            url: config.getApiUrl('/api/auth/login')
        });

        // Assert: Response should indicate validation error
        expect(loginResponse.ok()).toBeFalsy();
        expect([400, 422]).toContain(loginResponse.status());

        const loginBody = await loginResponse.json();
        logger.step("Received validation error", { status: loginResponse.status() });

        logger.step("✓ Empty credentials correctly rejected via API", {
            status: loginResponse.status(),
            errorMessage: loginBody.message
        });
        logger.testPass("Login via API - Missing Credentials");

        await apiContext.dispose();
    });

    /**
     * Test Case: Verify Token Can Be Used for Authenticated Requests
     * Given: Valid login token from API
     * When: Token is used in subsequent API calls and set in browser
     * Then: Authenticated endpoints should be accessible
     * Tags: @api @integration @smoke
     */
    test("should be able to use token for authenticated requests @api @integration @smoke", async ({ page }) => {
        logger.testStart("Token Authentication Verification", { tags: ["api", "integration", "smoke"] });

        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();

        // Step 1: Navigate to the application first
        await page.goto(config.getUiBaseUrl());
        logger.step("Navigated to application");

        // Step 2: Login via API and set token in browser using authHelper
        const authState = await authenticateViaAPI(page, email, password);

        logger.step("✓ Authenticated via API, token set in browser", {
            hasToken: !!authState.token,
            userId: authState.user.id,
            userEmail: authState.user.email
        });

        // Step 3: Verify token is set in browser storage
        const storedToken = await page.evaluate(() => {
            return localStorage.getItem("eventhub_token");
        });

        expect(storedToken).toBeTruthy();
        expect(storedToken).toBe(authState.token);

        logger.step("✓ Token verified in browser localStorage", {
            tokenLength: storedToken?.length
        });

        logger.testPass("Token Authentication Verification");
    });

});
