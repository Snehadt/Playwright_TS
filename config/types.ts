/**
 * Configuration Type Definitions
 * Provides type safety for all configuration values
 */

/**
 * Test credentials configuration
 */
export interface TestCredentials {
    email: string;
    password: string;
}

/**
 * API configuration
 */
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
}

/**
 * UI configuration
 */
export interface UiConfig {
    baseUrl: string;
    timeout: number;
    headless: boolean;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    name: 'local' | 'dev' | 'staging' | 'production';
    isCI: boolean;
}

/**
 * Complete test configuration
 */
export interface TestConfig {
    credentials: TestCredentials;
    api: ApiConfig;
    ui: UiConfig;
    environment: EnvironmentConfig;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
