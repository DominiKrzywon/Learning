import { BasePage } from '@_src/ui/pages/base.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { Page } from '@playwright/test';

export class DashboardPage extends BasePage {
  url = 'learning/dashboard.html';
  logOut = this.page.getByRole('link', { name: 'Sign Out' });
  courseList = this.page.locator('#courseList');
  myCourses = this.page.getByLabel('My Courses');
  enrollError = this.page.locator('.notification.error');
  errorMessage = 'Insufficient funds to enroll in this course';

  constructor(page: Page) {
    super(page);
  }

  async logout(): Promise<WelcomePage> {
    await this.logOut.click();

    return new WelcomePage(this.page);
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
