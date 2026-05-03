import { expect, test } from '@_src/merge.fixture';

test('DEMO-001 no logged user can read preview page', async ({
  previewPage,
}) => {
  await previewPage.goto('?id=1');
  await expect(previewPage.previewModeBanner).toBeVisible();
  await expect(previewPage.lockLessons).toBeVisible();
  await expect(previewPage.signInToTrackProgress).toBeVisible();
  await expect(previewPage.signInButton).toBeVisible();
});

