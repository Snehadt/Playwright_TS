import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Log Levels
 */
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

/**
 * Logger Singleton Class
 *
 * Provides centralized, structured logging for the test framework
 * with file and console outputs, log levels, and formatting.
 *
 * Features:
 * - Singleton pattern (one instance)
 * - Multiple log levels (error, warn, info, debug)
 * - Console output (colored, pretty)
 * - File output (JSON format for parsing)
 * - Test context tracking
 * - Timestamps
 * - Metadata support
 *
 * Usage:
 * ```typescript
 * import { Logger } from './utils/Logger';
 *
 * const logger = Logger.getInstance();
 * logger.info('Test started', { testName: 'LoginTest' });
 * logger.error('Test failed', { error: err.message });
 * ```
 */
export class Logger {
    private static instance: Logger;
    private logger: winston.Logger;
    private testContext: string = '';

    private constructor() {
        // Create logs directory if it doesn't exist
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Get log level from environment or default to 'info'
        const logLevel = process.env.LOG_LEVEL || 'info';

        // Custom format for console output (colorized, human-readable)
        const consoleFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                let msg = `${timestamp} [${level}]`;

                // Add test context if available
                if (this.testContext) {
                    msg += ` [${this.testContext}]`;
                }

                msg += `: ${message}`;

                // Add metadata if present
                const metaKeys = Object.keys(metadata);
                if (metaKeys.length > 0) {
                    // Filter out winston internal properties
                    const filteredMeta = Object.keys(metadata)
                        .filter(key => !['timestamp', 'level', 'message'].includes(key))
                        .reduce((obj, key) => {
                            obj[key] = metadata[key];
                            return obj;
                        }, {} as any);

                    if (Object.keys(filteredMeta).length > 0) {
                        msg += ` ${JSON.stringify(filteredMeta)}`;
                    }
                }

                return msg;
            })
        );

        // Custom format for file output (structured JSON)
        const fileFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        // Create Winston logger
        this.logger = winston.createLogger({
            level: logLevel,
            defaultMeta: { service: 'playwright-test-framework' },
            transports: [
                // Console transport (for development)
                new winston.transports.Console({
                    format: consoleFormat
                }),

                // File transport - All logs
                new winston.transports.File({
                    filename: path.join(logsDir, 'test-all.log'),
                    format: fileFormat,
                    maxsize: 10485760, // 10MB
                    maxFiles: 5
                }),

                // File transport - Error logs only
                new winston.transports.File({
                    filename: path.join(logsDir, 'test-error.log'),
                    level: 'error',
                    format: fileFormat,
                    maxsize: 10485760, // 10MB
                    maxFiles: 5
                })
            ]
        });
    }

    /**
     * Get Logger singleton instance
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Set test context (e.g., test name, test suite)
     * This will be included in all subsequent log messages
     */
    public setContext(context: string): void {
        this.testContext = context;
    }

    /**
     * Clear test context
     */
    public clearContext(): void {
        this.testContext = '';
    }

    /**
     * Get current test context
     */
    public getContext(): string {
        return this.testContext;
    }

    /**
     * Log ERROR level message
     * Use for test failures, critical errors, exceptions
     */
    public error(message: string, metadata?: Record<string, any>): void {
        this.logger.error(message, metadata);
    }

    /**
     * Log WARN level message
     * Use for warnings, deprecated features, potential issues
     */
    public warn(message: string, metadata?: Record<string, any>): void {
        this.logger.warn(message, metadata);
    }

    /**
     * Log INFO level message
     * Use for test progress, key events, test results
     */
    public info(message: string, metadata?: Record<string, any>): void {
        this.logger.info(message, metadata);
    }

    /**
     * Log DEBUG level message
     * Use for detailed debugging information, variable values
     */
    public debug(message: string, metadata?: Record<string, any>): void {
        this.logger.debug(message, metadata);
    }

    /**
     * Log test step (convenience method)
     * Uses INFO level with step indicator
     */
    public step(stepMessage: string, metadata?: Record<string, any>): void {
        this.info(`✓ ${stepMessage}`, metadata);
    }

    /**
     * Log test start
     */
    public testStart(testName: string, metadata?: Record<string, any>): void {
        this.setContext(testName);
        this.info(`🚀 Test started: ${testName}`, metadata);
    }

    /**
     * Log test pass
     */
    public testPass(testName: string, metadata?: Record<string, any>): void {
        this.info(`✅ Test passed: ${testName}`, metadata);
        this.clearContext();
    }

    /**
     * Log test fail
     */
    public testFail(testName: string, error: Error | string, metadata?: Record<string, any>): void {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.error(`❌ Test failed: ${testName}`, {
            error: errorMessage,
            stack: errorStack,
            ...metadata
        });
        this.clearContext();
    }

    /**
     * Log performance metric
     */
    public performance(operation: string, durationMs: number, metadata?: Record<string, any>): void {
        this.info(`⚡ ${operation} completed in ${durationMs}ms`, metadata);
    }

    /**
     * Log API call
     */
    public apiCall(method: string, url: string, statusCode?: number, metadata?: Record<string, any>): void {
        this.debug(`📡 API ${method} ${url}`, {
            statusCode,
            ...metadata
        });
    }

    /**
     * Log navigation
     */
    public navigation(url: string, metadata?: Record<string, any>): void {
        this.debug(`🔗 Navigated to: ${url}`, metadata);
    }

    /**
     * Create a child logger with additional default metadata
     */
    public child(metadata: Record<string, any>): winston.Logger {
        return this.logger.child(metadata);
    }

    /**
     * Get the underlying Winston logger (for advanced usage)
     */
    public getWinstonLogger(): winston.Logger {
        return this.logger;
    }
}

/**
 * Export singleton instance for convenience
 */
export const logger = Logger.getInstance();

/**
 * Export default as Logger class
 */
export default Logger;
