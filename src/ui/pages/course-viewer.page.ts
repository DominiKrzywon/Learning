import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class CourseViewerPage extends BasePage {
  url = 'learning/course-viewer.html';
  markAsCompleteButton = this.page.getByTestId('mark-complete');
  downloadTranscript = this.page.locator('.download-transcript');
  lessonCompletedNotification = this.page.locator('.notification.info');

  constructor(page: Page) {
    super(page);
  }

}
