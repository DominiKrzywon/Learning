import { BasePage } from '@_src/ui/pages/base.page';
import { LoginPage } from '@_src/ui/pages/login.page';
import { Page } from '@playwright/test';

export class WelcomePage extends BasePage {
  url = 'learning/welcome.html';
  goToLogin = this.page.getByRole('link', { name: 'Sign In' });
  logo = this.page.getByLabel('GAD Learning');
  demo = this.page.getByLabel('Demo');

  constructor(page: Page) {
    super(page);
  }

  async openLogin(): Promise<LoginPage> {
    await this.goToLogin.click();

    return new LoginPage(this.page);
  }
}
