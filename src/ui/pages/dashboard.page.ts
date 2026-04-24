import { BasePage } from '@_src/ui/pages/base.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { Page } from '@playwright/test';

export class DashboardPage extends BasePage {
  url = 'learning/dashboard.html';
  logOut = this.page.getByRole('link', { name: 'Sign Out' });
  courseList = this.page.locator('#courseList');

  constructor(page: Page) {
    super(page);
  }

  async logout(): Promise<WelcomePage> {
    await this.logOut.click();

    return new WelcomePage(this.page);
  }
}
