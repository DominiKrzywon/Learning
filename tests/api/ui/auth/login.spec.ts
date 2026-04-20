import { USER_NAME, USER_PASSWORD } from '@_config/env.config';
import { LoginPage } from '@_src/ui/pages/login.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import test, { expect } from '@playwright/test';

test('AUTH-001 should login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const welcomePage = new WelcomePage(page);

  await loginPage.goto();
  await loginPage.login({ username: USER_NAME, password: USER_PASSWORD });
  await welcomePage.waitForPageToLoadUrl();

  await expect(loginPage.courseList).toBeVisible();
});
