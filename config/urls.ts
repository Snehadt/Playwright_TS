import { ConfigManager } from './ConfigManager';

/**
 * Centralized URL Configuration
 * Now powered by ConfigManager singleton for better performance and validation
 */

// Get ConfigManager instance
const config = ConfigManager.getInstance();

// Base URLs from ConfigManager
export const BASE_URL = config.getUiBaseUrl();
export const API_BASE_URL = config.getApiBaseUrl();

/**
 * UI Endpoints
 */
export const UI_ENDPOINTS = {
    HOME: '/',
    EVENTS: '/events',
    EVENT_DETAIL: (eventId: number) => `/events/${eventId}`,
    ADMIN_EVENTS: '/admin/events',
    BOOKINGS: '/bookings',
    LOGIN: '/login',
    SIGNUP: '/signup',
    API_DOCS: '/api-docs',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',

    // Events
    EVENTS_LIST: '/api/events',
    EVENT_DETAIL: (eventId: number) => `/api/events/${eventId}`,
    CREATE_EVENT: '/api/events',
    UPDATE_EVENT: (eventId: number) => `/api/events/${eventId}`,
    DELETE_EVENT: (eventId: number) => `/api/events/${eventId}`,

    // Bookings
    BOOKINGS_LIST: '/api/bookings',
    BOOKING_DETAIL: (bookingId: number) => `/api/bookings/${bookingId}`,
    CREATE_BOOKING: '/api/bookings',
    UPDATE_BOOKING: (bookingId: number) => `/api/bookings/${bookingId}`,
    DELETE_BOOKING: (bookingId: number) => `/api/bookings/${bookingId}`,
} as const;

/**
 * Get full UI URL
 * @param endpoint - UI endpoint from UI_ENDPOINTS
 * @returns Full URL
 */
export function getUIUrl(endpoint: string): string {
    return config.getUiUrl(endpoint);
}

/**
 * Get full API URL
 * @param endpoint - API endpoint from API_ENDPOINTS
 * @returns Full API URL
 */
export function getAPIUrl(endpoint: string): string {
    return config.getApiUrl(endpoint);
}

/**
 * URL Builder Class for complex URL construction
 */
export class URLBuilder {
    private config: ConfigManager;

    constructor() {
        this.config = ConfigManager.getInstance();
    }

    /**
     * Build URL with query parameters
     * @param endpoint - Endpoint path
     * @param params - Query parameters
     * @returns Full URL with query string
     */
    buildWithParams(endpoint: string, params: Record<string, any>): string {
        const baseUrl = this.config.getUiBaseUrl();
        const url = new URL(endpoint, baseUrl);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        return url.toString();
    }

    /**
     * Build API URL
     * @param endpoint - API endpoint
     * @returns Full API URL
     */
    api(endpoint: string): string {
        return this.config.getApiUrl(endpoint);
    }

    /**
     * Build UI URL
     * @param endpoint - UI endpoint
     * @returns Full UI URL
     */
    ui(endpoint: string): string {
        return this.config.getUiUrl(endpoint);
    }
}

// Export singleton instance
export const urlBuilder = new URLBuilder();

/**
 * Environment configuration helper
 */
export const ENV = {
    isLocal: () => config.getUiBaseUrl().includes('localhost'),
    isStaging: () => config.getUiBaseUrl().includes('staging'),
    isProduction: () => config.getUiBaseUrl().includes('rahulshettyacademy.com'),
    baseUrl: config.getUiBaseUrl(),
    apiBaseUrl: config.getApiBaseUrl(),
    environment: config.getEnvironment(),
    isCI: config.isCI(),
} as const;
