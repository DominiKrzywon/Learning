import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class WelcomePage extends BasePage {
  url = 'learning/dashboard.html';

  constructor(page: Page) {
    super(page);
  }
}
