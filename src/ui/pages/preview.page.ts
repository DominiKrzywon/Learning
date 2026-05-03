import { BasePage } from '@_src/ui/pages/base.page';

export class PreviewPage extends BasePage {
  url = 'learning/preview.html';
  previewModeBanner = this.page.getByLabel('Preview Mode');
  signInToTrackProgress = this.page.getByLabel('Sign In to track progress');
  signInCta = this.page.locator('a.primary-button[aria-label="Sign In"]');
  lockLessons = this.page.getByRole('heading', {
    name: /More Lessons Available/i,
  });
  instructorLink = this.page.getByLabel('Instructor');
}
