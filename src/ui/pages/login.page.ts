import { LoginUserModel } from '@_src/ui/models/user.model';
import { BasePage } from '@_src/ui/pages/base.page';
import { DashboardPage } from '@_src/ui/pages/dashboard.page';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  url = 'learning/login.html';
  username = this.page.locator('#usernameInput');
  password = this.page.locator('#passwordInput');
  signInButton = this.page.getByRole('button', { name: 'Sign In' });

  errorMessage = this.page.getByText(
    'Login failed. Invalid username or password',
  );

  constructor(page: Page) {
    super(page);
  }

  async login(loginUserData: LoginUserModel): Promise<DashboardPage> {
    await this.username.fill(loginUserData.username);
    await this.password.fill(loginUserData.password);
    await this.signInButton.click();

    return new DashboardPage(this.page);
  }
}
