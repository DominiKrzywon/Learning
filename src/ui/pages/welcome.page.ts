import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class WelcomePage extends BasePage {
  url = 'learning/welcome.html';
  goToLogin = this.page.getByRole('link', { name: 'Sign In' });
  logo = this.page.getByLabel('GAD Learning');

  constructor(page: Page) {
    super(page);
  }

  async login(): Promise<WelcomePage> {
    await this.goToLogin.click();

    return new WelcomePage(this.page);
  }
}
