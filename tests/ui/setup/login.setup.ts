import { STORAGE_STAGE } from '@_pw-config';
import { expect, test as setup } from '@_src/merge.fixture';
import { testUserLearning } from '@_src/ui/test-data/user.data';

setup('login and save session', async ({ loginPage, page }) => {
  const expectedWelcomeTitle = 'Learning Dashboard';

  const welcomePage = await loginPage.login(testUserLearning);
  await welcomePage.waitForPageToLoadUrl();

  const title = await welcomePage.getTitle();
  expect(title).toContain(expectedWelcomeTitle);

  await page.context().storageState({ path: STORAGE_STAGE });
});
