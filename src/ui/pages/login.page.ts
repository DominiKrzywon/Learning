import { LoginUserModel } from '@_src/ui/models/user.model';
import { BasePage } from '@_src/ui/pages/base.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  url = 'learning/login.html';
  username = this.page.locator('#usernameInput');
  password = this.page.locator('#passwordInput');
  signInButton = this.page.getByRole('button', { name: 'Sign In' });
  courseList = this.page.locator('#courseList');

  constructor(page: Page) {
    super(page);
  }

  async login(loginUserData: LoginUserModel): Promise<WelcomePage> {
    await this.username.fill(loginUserData.username);
    await this.password.fill(loginUserData.password);
    await this.signInButton.click();

    return new WelcomePage(this.page);
  }
}
