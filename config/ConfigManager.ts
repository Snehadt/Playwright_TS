import dotenv from 'dotenv';
import path from 'path';
import { TestConfig, TestCredentials, ValidationResult } from './types';

/**
 * ConfigManager - Singleton Pattern
 *
 * Loads and manages all test configuration from environment variables.
 * Configuration is loaded ONCE on first access and cached for performance.
 *
 * Benefits:
 * - Single source of truth for all configuration
 * - Load .env file only once (not on every import)
 * - Type-safe configuration access
 * - Centralized validation
 * - Better performance (cached values)
 *
 * Usage:
 * ```typescript
 * const config = ConfigManager.getInstance();
 * const { email, password } = config.getCredentials();
 * const apiUrl = config.getApiUrl('/events');
 * ```
 */
export class ConfigManager {
    private static instance: ConfigManager;
    private config: TestConfig;
    private isInitialized: boolean = false;

    /**
     * Private constructor - prevents direct instantiation
     * Use getInstance() instead
     */
    private constructor() {
        this.loadEnvironment();
        this.config = this.buildConfig();
        this.validateConfig();
        this.isInitialized = true;

        console.log('✓ ConfigManager initialized');
    }

    /**
     * Get singleton instance
     * Creates instance on first call, returns cached instance on subsequent calls
     */
    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    /**
     * Reset singleton instance (useful for testing)
     * WARNING: Use only in test setup/teardown
     */
    public static resetInstance(): void {
        ConfigManager.instance = null as any;
    }

    /**
     * Load environment variables from .env file
     */
    private loadEnvironment(): void {
        const envPath = path.resolve(__dirname, '../.env');
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            console.warn(`⚠️ Warning: Could not load .env file from ${envPath}`);
            console.warn('Falling back to system environment variables');
        }
    }

    /**
     * Parse browsers from environment variable
     * Defaults to all browsers: chromium, firefox, webkit
     */
    private parseBrowsers(): string[] {
        const browserEnv = process.env.BROWSERS || 'chromium,firefox,webkit';
        return browserEnv.split(',').map(b => b.trim().toLowerCase());
    }

    /**
     * Get environment-specific URLs based on TEST_ENV
     */
    private getEnvironmentUrls(): { uiBaseUrl: string; apiBaseUrl: string } {
        const testEnv = (process.env.TEST_ENV || 'local').toLowerCase();

        // If URLs are explicitly set in .env, use them (manual override)
        if (process.env.BASE_URL && process.env.API_BASE_URL) {
            return {
                uiBaseUrl: process.env.BASE_URL,
                apiBaseUrl: process.env.API_BASE_URL
            };
        }

        // Auto-select URLs based on TEST_ENV
        switch (testEnv) {
            case 'local':
                return {
                    uiBaseUrl: process.env.BASE_URL || 'http://localhost:3000',
                    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080'
                };
            case 'staging':
                return {
                    uiBaseUrl: process.env.BASE_URL || 'https://staging.eventhub.rahulshettyacademy.com',
                    apiBaseUrl: process.env.API_BASE_URL || 'https://staging.api.eventhub.rahulshettyacademy.com'
                };
            case 'production':
            case 'prod':
                return {
                    uiBaseUrl: process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com',
                    apiBaseUrl: process.env.API_BASE_URL || 'https://api.eventhub.rahulshettyacademy.com'
                };
            default:
                console.warn(`⚠️ Unknown TEST_ENV: ${testEnv}, defaulting to production`);
                return {
                    uiBaseUrl: process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com',
                    apiBaseUrl: process.env.API_BASE_URL || 'https://api.eventhub.rahulshettyacademy.com'
                };
        }
    }

    /**
     * Build configuration object from environment variables
     */
    private buildConfig(): TestConfig {
        const urls = this.getEnvironmentUrls();

        return {
            credentials: {
                email: process.env.TEST_USER_EMAIL || '',
                password: process.env.TEST_USER_PASSWORD || ''
            },
            api: {
                baseUrl: urls.apiBaseUrl,
                timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
                retries: parseInt(process.env.API_RETRIES || '2', 10)
            },
            ui: {
                baseUrl: urls.uiBaseUrl,
                timeout: parseInt(process.env.UI_TIMEOUT || '30000', 10),
                headless: process.env.HEADLESS !== 'false',
                browsers: this.parseBrowsers()
            },
            environment: {
                name: (process.env.TEST_ENV as any) || 'local',
                isCI: process.env.CI === 'true'
            }
        };
    }

    /**
     * Validate configuration
     * Throws error if critical configuration is missing
     */
    private validateConfig(): void {
        const validation = this.validate();

        if (!validation.valid) {
            const errorMessage = [
                '❌ Configuration Validation Failed:',
                ...validation.errors.map(err => `   - ${err}`),
                '',
                'Please check your .env file and ensure all required variables are set.',
                'Copy .env.example to .env if it doesn\'t exist.'
            ].join('\n');

            throw new Error(errorMessage);
        }
    }

    /**
     * Validate configuration and return result
     */
    private validate(): ValidationResult {
        const errors: string[] = [];

        // Validate credentials
        if (!this.config.credentials.email) {
            errors.push('TEST_USER_EMAIL is required');
        }
        if (!this.config.credentials.password) {
            errors.push('TEST_USER_PASSWORD is required');
        }

        // Validate email format
        if (this.config.credentials.email && !this.isValidEmail(this.config.credentials.email)) {
            errors.push('TEST_USER_EMAIL must be a valid email address');
        }

        // Validate URLs
        if (!this.isValidUrl(this.config.api.baseUrl)) {
            errors.push('API_BASE_URL must be a valid URL');
        }
        if (!this.isValidUrl(this.config.ui.baseUrl)) {
            errors.push('BASE_URL must be a valid URL');
        }

        // Validate timeouts
        if (this.config.api.timeout < 1000) {
            errors.push('API_TIMEOUT must be at least 1000ms');
        }
        if (this.config.ui.timeout < 1000) {
            errors.push('UI_TIMEOUT must be at least 1000ms');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // ==================== Public Getters ====================

    /**
     * Get test user credentials
     * @returns Test credentials object
     */
    public getCredentials(): TestCredentials {
        return { ...this.config.credentials };
    }

    /**
     * Get API base URL
     * @returns API base URL
     */
    public getApiBaseUrl(): string {
        return this.config.api.baseUrl;
    }

    /**
     * Get API URL with endpoint
     * @param endpoint - API endpoint (e.g., '/api/auth/login')
     * @returns Full API URL
     */
    public getApiUrl(endpoint: string): string {
        const baseUrl = this.config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }

    /**
     * Get UI base URL
     * @returns UI base URL
     */
    public getUiBaseUrl(): string {
        return this.config.ui.baseUrl;
    }

    /**
     * Get UI URL with path
     * @param path - UI path (e.g., '/events')
     * @returns Full UI URL
     */
    public getUiUrl(path: string): string {
        const baseUrl = this.config.ui.baseUrl.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }

    /**
     * Get API timeout
     * @returns API timeout in milliseconds
     */
    public getApiTimeout(): number {
        return this.config.api.timeout;
    }

    /**
     * Get UI timeout
     * @returns UI timeout in milliseconds
     */
    public getUiTimeout(): number {
        return this.config.ui.timeout;
    }

    /**
     * Get API retries
     * @returns Number of API retries
     */
    public getApiRetries(): number {
        return this.config.api.retries;
    }

    /**
     * Get environment name
     * @returns Environment name
     */
    public getEnvironment(): string {
        return this.config.environment.name;
    }

    /**
     * Check if running in CI
     * @returns True if running in CI environment
     */
    public isCI(): boolean {
        return this.config.environment.isCI;
    }

    /**
     * Check if headless mode is enabled
     * @returns True if headless mode
     */
    public isHeadless(): boolean {
        return this.config.ui.headless;
    }

    /**
     * Get list of browsers to test on
     * @returns Array of browser names
     */
    public getBrowsers(): string[] {
        return [...this.config.ui.browsers];
    }

    /**
     * Get complete configuration (for debugging)
     * WARNING: Contains sensitive data - use carefully
     * @returns Complete configuration object
     */
    public getFullConfig(): TestConfig {
        return {
            ...this.config,
            credentials: {
                email: this.config.credentials.email,
                password: '***REDACTED***' // Never expose password
            }
        };
    }

    /**
     * Print configuration summary (safe for logs)
     */
    public printConfigSummary(): void {
        console.log('\n=== Configuration Summary ===');
        console.log(`Environment: ${this.config.environment.name}`);
        console.log(`CI Mode: ${this.config.environment.isCI}`);
        console.log(`Headless: ${this.config.ui.headless}`);
        console.log(`Browsers: ${this.config.ui.browsers.join(', ')}`);
        console.log(`UI Base URL: ${this.config.ui.baseUrl}`);
        console.log(`API Base URL: ${this.config.api.baseUrl}`);
        console.log(`API Timeout: ${this.config.api.timeout}ms`);
        console.log(`UI Timeout: ${this.config.ui.timeout}ms`);
        console.log(`Test User: ${this.config.credentials.email}`);
        console.log('============================\n');
    }
}

/**
 * Export singleton instance getter as default
 * Usage: import config from './config/ConfigManager'
 */
export default ConfigManager.getInstance;
