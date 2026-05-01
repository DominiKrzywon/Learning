import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class DashboardPage extends BasePage {
  url = 'learning/dashboard.html';
  courseList = this.page.locator('#courseList');
  myCourses = this.page.getByLabel('My Courses');
  dashboardUsername = this.page.getByLabel('Username');
  enrollError = this.page.locator('.notification.error');
  errorMessage = 'Insufficient funds to enroll in this course';

  constructor(page: Page) {
    super(page);
  }

  async reload() {
    await this.page.reload();
  }

  getCourse(courseId: number) {
    const courseButton = this.page.locator(`#continue-button-${courseId}`);

    return courseButton;
  }

  getEnrollButton(courseId: number) {
    const enrollButton = this.page.locator(`#enroll-button-${courseId}`);

    return enrollButton;
  }
}
