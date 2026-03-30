# REQ-007 Funds — Action Plan

## Goal

Write business tests for the **Funds** feature following existing patterns from REQ-003 and REQ-011.

---

## 1. Endpoints (from `cases.md`)

| Method | URL                                          | Purpose                   |
| ------ | -------------------------------------------- | ------------------------- |
| GET    | `/api/learning/users/{userId}/funds`         | Read current user balance |
| PUT    | `/api/learning/users/{userId}/funds`         | Update user balance       |
| GET    | `/api/learning/users/{userId}/funds/history` | Get transaction history   |

> **First task:** These URLs are **not yet** in `src/utils/api.util.ts`. You need to add them before writing tests.

---

## 2. What to create / modify (step by step)

### Step 1 — Add API URL helpers

Open `src/utils/api.util.ts` and add three new URL builders inside the `apiUrls` object:

- `getUserFundsUrl(userId)` → `GET /api/learning/users/{userId}/funds`
- `putUserFundsUrl(userId)` → `PUT /api/learning/users/{userId}/funds`
- `getUserFundsHistoryUrl(userId)` → `GET /api/learning/users/{userId}/funds/history`

Pattern to follow — look at the existing `getUserProfileUrl` / `putUserProfileUrl`.

### Step 2 — (Optional) Create a funds model

Create `src/models/funds.model.ts` with TypeScript interfaces describing the expected API responses.

Think about:

- What fields does a **balance response** have? (e.g. `balance`, `userId`, `currency`?)
- What fields does a **history entry** have? (e.g. `id`, `amount`, `date`, `type`?)

> Tip: Make a quick manual GET call first (via Playwright debug or curl) to see real response shapes. Then model the interfaces.

### Step 3 — (Optional) Create a funds helper

Create `src/helper/funds.ts` with reusable functions, following the pattern of `src/helper/progress.ts`:

- `getUserFunds(request, authHeader, userId)` → calls GET funds, returns parsed balance
- `updateUserFunds(request, authHeader, userId, amount)` → calls PUT funds
- `getUserFundsHistory(request, authHeader, userId)` → calls GET history, returns array

> Helpers are optional — you can put the logic directly in tests at first, then refactor later.

### Step 4 — Write the tests

File: `tests/api/business/req-007-funds.spec.ts`

---

## 3. Test Scenarios (minimum 3 — at least 1 positive, 1 negative)

### Test 1: `REQ-007 should read balance and update funds correctly` (positive)

Business intent: Verify that funds can be read, updated, and the new balance is persisted.

Steps:

1. Get current balance (`GET funds`)
2. Update balance with a valid amount (`PUT funds`)
3. Get balance again (`GET funds`)
4. **Assert:** new balance reflects the update
5. **Assert:** response shape is correct (status 200, expected fields)

### Test 2: `REQ-007 should create a transaction history entry after fund update` (positive)

Business intent: Verify that every fund mutation leaves an auditable trace.

Steps:

1. Get current history (`GET history`) — save length
2. Update funds with a valid amount (`PUT funds`)
3. Get history again (`GET history`)
4. **Assert:** history array has one more entry than before
5. **Assert:** the newest entry matches the amount/type from step 2

### Test 3: `REQ-007 should reject out-of-range amount` (negative)

Business intent: Verify that the system enforces amount limits.

Steps:

1. Try to update funds with a negative, zero, or extremely large amount (`PUT funds`)
2. **Assert:** response status is NOT 200 (expect 400 or 422)
3. **Assert:** response body contains an error message
4. Re-read balance (`GET funds`) and **assert** it has not changed

### Bonus Test 4 (optional): `REQ-007 should not allow fund access without authentication`

Steps:

1. Call `GET /api/learning/users/{userId}/funds` **without** `Authorization` header
2. **Assert:** status is 401 (UNAUTHORIZED)

---

## 4. Boilerplate Template (structure only — fill in the logic yourself)

```typescript
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('REQ-007 Funds', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-007 should read balance and update funds correctly', async ({
    request,
    loggedUser,
  }) => {
    // TODO: implement
  });

  test('REQ-007 should create a transaction history entry after fund update', async ({
    request,
    loggedUser,
  }) => {
    // TODO: implement
  });

  test('REQ-007 should reject out-of-range amount', async ({
    request,
    loggedUser,
  }) => {
    // TODO: implement
  });
});
```

---

## 5. Checklist before running

- [ ] New URL helpers added to `src/utils/api.util.ts`
- [ ] (Optional) `src/models/funds.model.ts` created
- [ ] (Optional) `src/helper/funds.ts` created
- [ ] Test file has at least 3 tests
- [ ] At least 1 positive and 1 negative test
- [ ] Each test verifies **business impact** (before/after state), not just status code
- [ ] No test-to-test dependency
- [ ] `beforeEach` calls `restoreSystem`
- [ ] Test names use `REQ-007` prefix
- [ ] All tests pass: `npx playwright test tests/api/business/req-007-funds.spec.ts --project=api`

---

## 6. Patterns from existing tests to follow

| Pattern                       | Where to look                                    |
| ----------------------------- | ------------------------------------------------ |
| Fixture `loggedUser`          | `src/fixtures/user.fixture.ts`                   |
| `restoreSystem` in beforeEach | `src/helper/restore.ts`                          |
| URL helper functions          | `src/utils/api.util.ts`                          |
| Auth header usage             | REQ-003 and REQ-011 tests                        |
| Before/after state assertion  | REQ-003 progress test (get → act → get → assert) |
| Error response assertion      | REQ-011 bad password test                        |
| HTTP status constants         | `src/utils/http-status.ts`                       |

---

## 7. Key Learnings from REQ-003 & REQ-011

1. **Each test registers its own user** via the `loggedUser` fixture — this ensures parallel safety.
2. **`restoreSystem`** in `beforeEach` resets the database to a clean state (uses `/restore2`).
3. **Destructure `loggedUser`** to get `{ authHeader, userId, username, password }`.
4. **State validation pattern:** read state → perform action → read state again → compare.
5. **Negative tests:** send bad data, assert error status AND error message in body.
6. The `request` object from Playwright is used for all HTTP calls.

Good luck! Work through the steps one at a time. Run the test file after each change.
