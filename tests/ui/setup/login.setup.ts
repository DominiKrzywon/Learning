import { STORAGE_STAGE } from '@_pw-config';
import { expect, test as setup } from '@_src/merge.fixture';
import { testUserLearningUI } from '@_src/test-data/user.data';

setup('login and save session', async ({ loginPage, page }) => {
  const expectedWelcomeTitle = 'Learning Dashboard';

  const dashboardPage = await loginPage.login(testUserLearningUI);
  await dashboardPage.waitForPageToLoadUrl();

  const title = await dashboardPage.getTitle();
  expect(title).toContain(expectedWelcomeTitle);

  await page.context().storageState({ path: STORAGE_STAGE });
});
