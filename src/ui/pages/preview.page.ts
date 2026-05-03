import { BasePage } from '@_src/ui/pages/base.page';

export class PreviewPage extends BasePage {
  url = 'learning/preview.html';
  previewModeBanner = this.page.getByLabel('Preview Mode');
  signInToTrackProgress = this.page.getByLabel('Sign In to track progress');
  lockLessons = this.page.getByRole('heading', {
    name: /More Lessons Available/i,
  });
  signInButton = this.page.getByLabel('Sign In to track progress');
}
