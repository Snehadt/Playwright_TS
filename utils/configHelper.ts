import { ConfigManager } from '../config/ConfigManager';

/**
 * Legacy Config Helper
 *
 * This file maintains backward compatibility with existing tests.
 * All functions now delegate to ConfigManager singleton.
 *
 * MIGRATION NOTE:
 * New code should use ConfigManager directly:
 * ```typescript
 * import { ConfigManager } from '../config/ConfigManager';
 * const config = ConfigManager.getInstance();
 * const { email, password } = config.getCredentials();
 * ```
 */

/**
 * Get test user credentials from ConfigManager
 *
 * @deprecated Use ConfigManager.getInstance().getCredentials() instead
 * @returns Test credentials object
 */
export function getTestCredentials(): { email: string; password: string } {
    const config = ConfigManager.getInstance();
    return config.getCredentials();
}

/**
 * Get test credentials (alias for getTestCredentials)
 *
 * @deprecated Use ConfigManager.getInstance().getCredentials() instead
 * @returns Test credentials object
 */
export function getCredentials() {
    return getTestCredentials();
}

