import { LoginPage } from '@_src/ui/pages/login.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { test as baseTest } from '@playwright/test';

interface Pages {
  loginPage: LoginPage;
  welcomePage: WelcomePage;
}

export const pageObjectTest = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  welcomePage: async ({ page }, use) => {
    const welcomePage = new WelcomePage(page);
    await welcomePage.goto();
    await use(welcomePage);
  },
});
