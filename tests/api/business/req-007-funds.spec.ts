import { expect, test } from '@_src/fixtures/user.fixture';
import { getUserFunds, updateUserFunds } from '@_src/helper/funds';
import { restoreSystem } from '@_src/helper/restore';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

const amount = 500;

test.describe('REQ-007 Funds', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-007 should read balance and update funds correctly', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const fundsBeforeUpdate = await getUserFunds(request, authHeader, userId);
    expect(fundsBeforeUpdate.funds).toBeLessThanOrEqual(0);

    const updatedFunds = await updateUserFunds(
      request,
      authHeader,
      userId,
      amount,
    );
    expect(updatedFunds.newBalance).toEqual(amount);

    const getUserFundsSecond = await getUserFunds(request, authHeader, userId);
    expect(getUserFundsSecond.funds).toEqual(amount);
  });

  test('REQ-007 should create a transaction history entry after fund update', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const getHistory = await request.get(
      apiUrls.getUserFundsHistoryUrl(userId),
      { headers: { Authorization: authHeader } },
    );

    const historyJson = await getHistory.json();
    expect(Array.isArray(historyJson.history)).toBe(true);
    expect(historyJson.history.length).toBeLessThanOrEqual(0);

    const updateUserFunds = await request.put(apiUrls.putUserFundsUrl(userId), {
      headers: { Authorization: authHeader },
      data: { amount: 500 },
    });
    expect(updateUserFunds.status()).toBe(HTTP_STATUS.OK);

    const getUpdatedHistory = await request.get(
      apiUrls.getUserFundsHistoryUrl(userId),
      { headers: { Authorization: authHeader } },
    );

    const getUpdatedHistoryJson = await getUpdatedHistory.json();
    expect(Array.isArray(getUpdatedHistoryJson.history)).toBe(true);
    expect(getUpdatedHistoryJson.history[0].amount).toEqual(500);
    expect(getUpdatedHistoryJson.history.length).toBeGreaterThan(0);
  });

  test('REQ-007 should reject out-of-range amount', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const headers = { Authorization: authHeader };

    await test.step('should accept 0 amount', async () => {
      const updateUserFundsZero = await request.put(
        apiUrls.putUserFundsUrl(userId),
        {
          headers,
          data: { amount: 0 },
        },
      );
      expect(updateUserFundsZero.status()).toBe(HTTP_STATUS.OK);
    });

    await test.step('should reject negative amount', async () => {
      const updateUserFundsMinus = await request.put(
        apiUrls.putUserFundsUrl(userId),
        {
          headers,
          data: { amount: -100 },
        },
      );
      expect(updateUserFundsMinus.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = await updateUserFundsMinus.json();
      expect(body).toHaveProperty('error');
    });

    await test.step('should reject extremely high amount', async () => {
      const updateUserFundsToMuch = await request.put(
        apiUrls.putUserFundsUrl(userId),
        {
          headers,
          data: { amount: 1000000000 },
        },
      );
      expect(updateUserFundsToMuch.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    await test.step('should record only successful update in history', async () => {
      const getHistory = await request.get(
        apiUrls.getUserFundsHistoryUrl(userId),
        { headers },
      );
      expect(getHistory.status()).toBe(HTTP_STATUS.OK);
      const getHistoryJson = await getHistory.json();

      expect(Array.isArray(getHistoryJson.history)).toBe(true);
      expect(getHistoryJson.history.length).toEqual(0);
    });
  });
});
