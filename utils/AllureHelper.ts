import { test } from '@playwright/test';

/**
 * Allure Helper Utilities
 *
 * Provides convenience methods for adding Allure annotations and metadata to tests.
 * These enhance the Allure report with rich information about test execution.
 *
 * Usage:
 * ```typescript
 * import { AllureHelper } from '../utils/AllureHelper';
 *
 * test('My Test', async ({ page }) => {
 *   AllureHelper.addEpic('User Management');
 *   AllureHelper.addFeature('Login');
 *   AllureHelper.addStory('User can login with valid credentials');
 *   AllureHelper.addSeverity('critical');
 *   AllureHelper.addOwner('QA Team');
 *
 *   AllureHelper.step('Navigate to login page', async () => {
 *     await page.goto('/login');
 *   });
 * });
 * ```
 */
export class AllureHelper {
    /**
     * Add Epic annotation (highest level grouping)
     * Groups related features together
     */
    static addEpic(epic: string): void {
        test.info().annotations.push({ type: 'epic', description: epic });
    }

    /**
     * Add Feature annotation (mid-level grouping)
     * Groups related user stories together
     */
    static addFeature(feature: string): void {
        test.info().annotations.push({ type: 'feature', description: feature });
    }

    /**
     * Add Story annotation (lowest level grouping)
     * Represents a specific user story or scenario
     */
    static addStory(story: string): void {
        test.info().annotations.push({ type: 'story', description: story });
    }

    /**
     * Add Severity annotation
     * Indicates the importance/severity of the test
     * Values: 'blocker', 'critical', 'normal', 'minor', 'trivial'
     */
    static addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
        test.info().annotations.push({ type: 'severity', description: severity });
    }

    /**
     * Add Owner annotation
     * Indicates who owns/maintains this test
     */
    static addOwner(owner: string): void {
        test.info().annotations.push({ type: 'owner', description: owner });
    }

    /**
     * Add Tag annotation
     * Custom tags for filtering and categorization
     */
    static addTag(tag: string): void {
        test.info().annotations.push({ type: 'tag', description: tag });
    }

    /**
     * Add Link annotation
     * Links to external resources (JIRA, docs, etc.)
     */
    static addLink(url: string, name?: string): void {
        test.info().annotations.push({
            type: 'link',
            description: name ? `[${name}](${url})` : url
        });
    }

    /**
     * Add Issue/Bug link
     * Links to bug tracker issue
     */
    static addIssue(issueId: string, url?: string): void {
        const description = url ? `[${issueId}](${url})` : issueId;
        test.info().annotations.push({ type: 'issue', description });
    }

    /**
     * Add Test Case ID
     * Links to test case management system
     */
    static addTestCaseId(testCaseId: string, url?: string): void {
        const description = url ? `[${testCaseId}](${url})` : testCaseId;
        test.info().annotations.push({ type: 'tms', description });
    }

    /**
     * Add Description
     * Detailed description of the test
     */
    static addDescription(description: string): void {
        test.info().annotations.push({ type: 'description', description });
    }

    /**
     * Add custom parameter to report
     * Shows in the test parameters section
     */
    static addParameter(name: string, value: string | number | boolean): void {
        test.info().annotations.push({
            type: 'parameter',
            description: `${name}: ${value}`
        });
    }

    /**
     * Add environment info
     */
    static addEnvironment(name: string, value: string): void {
        test.info().annotations.push({
            type: 'environment',
            description: `${name}=${value}`
        });
    }

    /**
     * Create a test step with a name
     * Steps appear in Allure report with execution details
     */
    static async step<T>(name: string, body: () => Promise<T>): Promise<T> {
        return await test.step(name, body);
    }

    /**
     * Attach data to the test report
     * Can attach text, JSON, images, etc.
     */
    static async attach(name: string, data: string | Buffer, type: string = 'text/plain'): Promise<void> {
        await test.info().attach(name, { body: data, contentType: type });
    }

    /**
     * Attach screenshot to report
     */
    static async attachScreenshot(name: string, screenshot: Buffer): Promise<void> {
        await test.info().attach(name, { body: screenshot, contentType: 'image/png' });
    }

    /**
     * Attach JSON data to report
     */
    static async attachJSON(name: string, data: any): Promise<void> {
        await test.info().attach(name, {
            body: JSON.stringify(data, null, 2),
            contentType: 'application/json'
        });
    }

    /**
     * Mark test as flaky
     * Indicates the test is known to be unstable
     */
    static markFlaky(): void {
        test.info().annotations.push({ type: 'tag', description: 'flaky' });
    }

    /**
     * Mark test as known issue
     * Test failure is expected due to known bug
     */
    static markKnownIssue(issueId: string): void {
        test.info().annotations.push({ type: 'tag', description: 'known-issue' });
        AllureHelper.addIssue(issueId);
    }

    /**
     * Set suite name for grouping
     */
    static setSuite(suiteName: string): void {
        test.info().annotations.push({ type: 'suite', description: suiteName });
    }

    /**
     * Set parent suite name (highest level)
     */
    static setParentSuite(parentSuiteName: string): void {
        test.info().annotations.push({ type: 'parentSuite', description: parentSuiteName });
    }

    /**
     * Set sub suite name (lowest level)
     */
    static setSubSuite(subSuiteName: string): void {
        test.info().annotations.push({ type: 'subSuite', description: subSuiteName });
    }
}

/**
 * Export convenience function for steps
 */
export const allureStep = AllureHelper.step;

/**
 * Export default
 */
export default AllureHelper;
