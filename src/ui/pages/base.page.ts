import { Page } from '@playwright/test';

export class BasePage {
  url = '';

  constructor(protected page: Page) {}

  async goto(parameters = ''): Promise<void> {
    await this.page.goto(`${this.url}${parameters}`);
  }

  async logout(): Promise<void> {
    await this.logOut.click();
  }

  async getTitle() {
    return await this.page.title();
  }

  async waitForPageToLoadUrl() {
    await this.page.waitForURL(this.url);
  }

  get logOut() {
    return this.page.getByRole('link', { name: 'Sign Out' });
  }
}
