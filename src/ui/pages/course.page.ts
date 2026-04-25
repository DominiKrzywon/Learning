import { BasePage } from '@_src/ui/pages/base.page';
import { CourseViewerPage } from '@_src/ui/pages/course-viewer.page';
import { Page } from '@playwright/test';

export class CourseDetailsPage extends BasePage {
  url = 'learning/course-details.html';
  enrollButton = this.page.getByRole('button', { name: /Enroll Now/ });
  courseTitle = this.page.getByRole('heading', { level: 1 });

  constructor(page: Page) {
    super(page);
  }

  async enroll(): Promise<CourseViewerPage> {
    await this.enrollButton.click();

    return new CourseViewerPage(this.page);
  }
}
