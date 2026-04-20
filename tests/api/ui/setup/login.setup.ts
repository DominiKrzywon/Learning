import { STORAGE_STAGE } from '@_pw-config';
import { testUser1 } from '@_src/test-data/user.data';
import { LoginPage } from '@_src/ui/pages/login.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { expect, test as setup } from '@playwright/test';

setup('login and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const expectedWelcomeTitle = 'Learning Dashboard';

  await page.goto(loginPage.url);
  await loginPage.login(testUser1);

  const welcomePage = new WelcomePage(page);
  await welcomePage.waitForPageToLoadUrl();

  const title = await welcomePage.getTitle();
  expect(title).toContain(expectedWelcomeTitle);

  await page.context().storageState({ path: STORAGE_STAGE });
});
