import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ConfigManager } from "../config/ConfigManager";

export class LoginPage extends BasePage {
    private readonly username: Locator;
    private readonly password: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;
    private readonly successIndicator: Locator;

    constructor(page: Page) {
        super(page);
        this.username = page.locator('#email');
        this.password = page.locator('#password');
        this.loginButton = page.getByRole('button', { name: /Sign In/i });
        this.errorMessage = page.locator('.error-message');
        this.successIndicator = page.locator('[data-testid="user-menu"]');
    }

    async navigateToLoginPage(): Promise<this> {
        const config = ConfigManager.getInstance();
        const loginUrl = config.getUiUrl('/login/');
        await this.navigateTo(loginUrl);
        return this;
    }

    async login(username: string, password: string): Promise<this> {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        await this.fillText(this.username, username);
        await this.fillText(this.password, password);
        await this.clickElement(this.loginButton);
        await this.waitForPageLoad('networkidle');
        return this;
    }

    async isOnLoginPage(): Promise<boolean> {
        return this.urlContains('/login');
    }

    async isErrorMessageVisible(): Promise<boolean> {
        return await this.isVisible(this.errorMessage);
    }

    async isSuccessIndicatorVisible(): Promise<boolean> {
        return await this.isVisible(this.successIndicator);
    }

    async getErrorMessageText(): Promise<string> {
        return await this.getTextContent(this.errorMessage);
    }

}
