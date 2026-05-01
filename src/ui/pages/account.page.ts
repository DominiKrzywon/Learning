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

  // update profile
  profileFirstName = this.page.locator('.firstName');
  profileLastName = this.page.locator('.lastName');
  profileEmail = this.page.locator('.email');
  profileUpdateCurrentPassword = this.page.locator('.confirmProfilePassword');
  profileUpdateButton = this.page.getByRole('button', {
    name: 'Update Profile',
  });
  profileUpdateSuccess = this.page
    .locator('.notification.success')
    .filter({ hasText: 'Profile updated successfully! Please sign in again.' });
  profileUpdateError = this.page
    .locator('.notification.error')
    .filter({ hasText: 'Please enter your current password' });

  // change password
  changePasswordCurrent = this.page.locator('#changePasswordCurrentPassword');
  changePasswordNew = this.page.locator('#newPassword');
  changePasswordConfirm = this.page.locator('#confirmPassword');
  changePasswordButton = this.page.locator('#changePasswordBtn');
  changePasswordSuccess = this.page
    .locator('notification.success')
    .filter({ hasText: 'Password changed successfully!' });
  changePasswordError = this.page
    .locator('.notification.error')
    .filter({ hasText: 'Current password is incorrect' });

  // deactivate
  deactivatePasswordInput = this.page.locator('#deactivatePassword');
  deactivateConfirmCheckbox = this.page.locator('#deactivateConfirm');
  deactivateButton = this.page.locator('#deactivateAccountBtn');

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

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }) {
    if (data.firstName) {
      await this.profileFirstName.fill(data.firstName);
    }
    if (data.lastName) {
      await this.profileLastName.fill(data.lastName);
    }
    if (data.email) {
      await this.profileEmail.fill(data.email);
    }
    if (data.password) {
      await this.profileUpdateCurrentPassword.fill(data.password);
    }

    await this.profileUpdateButton.click();
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.changePasswordCurrent.fill(currentPassword);
    await this.changePasswordNew.fill(newPassword);
    await this.changePasswordConfirm.fill(newPassword);
    await this.changePasswordButton.click();
  }

  async deactivateAccount(currentPassword: string): Promise<void> {
    await this.deactivatePasswordInput.fill(currentPassword);
    await this.deactivateConfirmCheckbox.check();
    await this.deactivateButton.click();
  }
}
