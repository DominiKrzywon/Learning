import { Locator } from '@playwright/test';

export class Modal {
  readonly root: Locator;

  constructor(root: Locator) {
    this.root = root;
  }

  async waitForVisible() {
    await this.root.waitFor({ state: 'visible' });
  }

  async waitForHidden() {
    await this.root.waitFor({ state: 'hidden' });
  }

  async isVisible() {
    return this.root.isVisible();
  }

  locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  getByText(text: string): Locator {
    return this.root.getByText(text);
  }

  getButtonByText(text: string): Locator {
    return this.root.getByRole('button', { name: text });
  }
}
