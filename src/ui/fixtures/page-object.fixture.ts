import { AccountSettingsPage } from '@_src/ui/pages/account.page';
import { CourseViewerPage } from '@_src/ui/pages/course-viewer.page';
import { CourseDetailsPage } from '@_src/ui/pages/course.page';
import { DashboardPage } from '@_src/ui/pages/dashboard.page';
import { LoginPage } from '@_src/ui/pages/login.page';
import { PreviewPage } from '@_src/ui/pages/preview.page';
import { WelcomePage } from '@_src/ui/pages/welcome.page';
import { test as baseTest } from '@playwright/test';

interface Pages {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  welcomePage: WelcomePage;
  courseDetailsPage: CourseDetailsPage;
  courseViewerPage: CourseViewerPage;
  accountSettingsPage: AccountSettingsPage;
  previewPage: PreviewPage;
}

export const pageObjectTest = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  welcomePage: async ({ page }, use) => {
    const welcomePage = new WelcomePage(page);
    await use(welcomePage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await use(dashboardPage);
  },

  courseDetailsPage: async ({ page }, use) => {
    const courseDetailsPage = new CourseDetailsPage(page);
    await use(courseDetailsPage);
  },

  courseViewerPage: async ({ page }, use) => {
    const courseViewerPage = new CourseViewerPage(page);
    await use(courseViewerPage);
  },

  accountSettingsPage: async ({ page }, use) => {
    const accountSettingsPage = new AccountSettingsPage(page);
    await use(accountSettingsPage);
  },

  previewPage: async ({ page }, use) => {
    const previewPage = new PreviewPage(page);
    await use(previewPage);
  },
});
