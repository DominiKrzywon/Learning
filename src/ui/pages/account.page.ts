import { ConfirmActionModal } from '@_src/ui/components/confirmActionModal';
import {
  TopUpAmount,
  TopUpSelectionModal,
} from '@_src/ui/components/topUpModal';
import { BasePage } from '@_src/ui/pages/base.page';
import { Page } from '@playwright/test';

export class AccountSettingsPage extends BasePage {
  url = 'learning/account.html';

  topUpButton = this.page.locator('#topUpBtn');
  fundsAmount = this.page.locator('.funds-amount');
  topUpSuccessNotification = this.page
    .locator('.notification.success')
    .filter({ hasText: 'Successfully added' });

  constructor(page: Page) {
    super(page);
  }

  private get topUpDialogRoot() {
    return this.page.locator('.top-up-dialog:visible').filter({
      has: this.page.getByRole('heading', { name: 'Top Up Funds' }),
    });
  }

  private get confirmActionDialogRoot() {
    return this.page.locator('.top-up-dialog:visible').filter({
      has: this.page.getByRole('heading', { name: 'Confirm Action' }),
    });
  }

  get topUpModal(): TopUpSelectionModal {
    return new TopUpSelectionModal(this.topUpDialogRoot);
  }

  get confirmActionModal(): ConfirmActionModal {
    return new ConfirmActionModal(this.confirmActionDialogRoot);
  }

  async getFundsValue(): Promise<number> {
    await this.fundsAmount.first().waitFor({ state: 'visible' });
    const text = await this.fundsAmount.first().innerText();
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  topUpSuccessMessage(amount: TopUpAmount): string {
    return `Successfully added $${amount.toFixed(2)} to your account`;
  }

  async topUpFunds(
    amount: TopUpAmount,
  ): Promise<{ before: number; after: number }> {
    const before = await this.getFundsValue();
    await this.topUpButton.click();
    await this.topUpModal.waitForVisible();
    await this.topUpModal.selectAmount(amount);
    await this.topUpModal.clickTopUp();

    if (await this.confirmActionModal.isVisible()) {
      await this.confirmActionModal.confirmYes();
    }
    await this.topUpSuccessNotification
      .filter({ hasText: this.topUpSuccessMessage(amount) })
      .waitFor({ state: 'visible' });

    const after = await this.getFundsValue();

    return { before, after };
  }
}
