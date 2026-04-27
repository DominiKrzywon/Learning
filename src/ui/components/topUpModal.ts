import { Modal } from '@_src/ui/components/modal';
import { Locator } from '@playwright/test';

export type TopUpAmount = 10 | 25 | 50 | 100 | 200 | 500;

export class TopUpSelectionModal extends Modal {
  constructor(root: Locator) {
    super(root);
  }

  amountOption(amount: TopUpAmount): Locator {
    return this.locator(
      `.top-up-amounts .amount-option[data-amount="${amount}"]`,
    );
  }

  async selectAmount(amount: TopUpAmount): Promise<void> {
    await this.amountOption(amount).click();
  }

  async clickTopUp(): Promise<void> {
    await this.getButtonByText('Top Up').click();
  }

  async cancel() {
    await this.getButtonByText('Cancel').click();
  }
}
