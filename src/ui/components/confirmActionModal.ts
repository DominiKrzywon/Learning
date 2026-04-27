import { Modal } from '@_src/ui/components/modal';
import { Locator } from '@playwright/test';

export class ConfirmActionModal extends Modal {
  constructor(root: Locator) {
    super(root);
  }

  async confirmYes(): Promise<void> {
    await this.locator('#confirmYes').click();
  }

  async cancel(): Promise<void> {
    await this.locator('#confirmCancel').click();
  }
}
