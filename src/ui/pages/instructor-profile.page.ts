import { BasePage } from '@_src/ui/pages/base.page';

export class InstructorPage extends BasePage {
  url = 'learning/instructor-profile.html';
  heading = this.page.getByRole('heading', { name: 'Instructor Profile' });
  coursesList = this.page.locator('#coursesList');
}
