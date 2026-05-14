import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class RegisterPage extends BasePage {
  backToWelcomeButton = this.page.locator('.return-button');
  header = this.page.getByRole('heading', { name: 'Create Account' });
  newAvatarButton = this.page.locator('.randomize-avatar-btn');
  firstName = this.page.locator('#firstNameInput');
  lastName = this.page.locator('#lastNameInput');
  username = this.page.locator('#usernameInput');
  email = this.page.locator('#emailInput');
  password = this.page.locator('#passwordInput');
  confirm = this.page.locator('#confirmPasswordInput');
  createButton = this.page.locator('.primary-button');
  signInLink = this.page.getByRole('link', { name: 'Sign In' });

  constructor(page: Page) {
    super(page);
  }
}
