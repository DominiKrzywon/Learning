# Refactor Plan v2 — API Client Layer & Test Architecture

> Previous refactor (v1) is complete: assertions removed from helpers, enroll deduplicated,  
> restore pattern unified, naming/tags fixed, magic numbers extracted, dead code removed,  
> `userProfileData` converted to factory function.

After each step run: `npx playwright test --project=api`

---

## Part 1 — API Client layer (biggest win)

### Why

Right now tests are full of raw `request.get(...)`, `request.put(...)`, `request.post(...)` calls  
with inline URL construction and header injection. This leads to:

- **duplication** — the same endpoint + headers pattern copied across many test files
- **fragility** — changing an endpoint or header format means editing 20+ places
- **low readability** — the test reads like HTTP plumbing, not a business scenario

The `src/helper/funds.ts` file already follows a better pattern (functions that wrap raw calls  
and return `{ res, json }`). The goal is to apply this consistently across **all** API domains  
using class-based API clients.

### Why classes and not standalone functions?

With standalone functions every call needs `(request, authHeader, userId, ...)`.  
A class stores `request` and `authHeader` in the constructor, so calls become:

```ts
const userApi = new UserApi(request, authHeader);
await userApi.updateProfile(userId, payload);
```

Less noise, fewer chances to mix up parameters, and the IDE autocomplete shows  
all available operations for a given domain in one place.

### Architecture

```
src/
  api/                        ← NEW directory
    auth.api.ts               ← AuthApi
    user.api.ts               ← UserApi
    course.api.ts             ← CourseApi
    lesson.api.ts             ← LessonApi
    funds.api.ts              ← FundsApi
```

Each class:

- receives `APIRequestContext` (and optionally `authHeader`) via constructor
- one method per API action
- returns `APIResponse` (or `{ res, json }` for typed convenience methods)
- **no assertions**, no `expect` — same rule as current helpers
- throws `Error` only on infrastructure failures (e.g. network), not on 4xx (that's for tests to assert)

### Step-by-step

| Step | File                    | What to create                                                                                                                                                                                                                         |
| ---- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `src/api/auth.api.ts`   | `AuthApi` class with: `login(data)`, `register(data)`, `getAuthStatus()`. Constructor takes `request`. No `authHeader` needed here (pre-auth). `login` returns raw `APIResponse` so the test decides what to assert.                   |
| 2    | `src/api/user.api.ts`   | `UserApi` class with: `getProfile(userId)`, `updateProfile(userId, payload)`, `changePassword(userId, payload)`, `deactivate(userId, payload)`, `getPublicProfile(userId)`. Constructor takes `request` + `authHeader`.                |
| 3    | `src/api/course.api.ts` | `CourseApi` with: `getAll()`, `getById(courseId)`, `getRatings(courseId)`, `enroll(courseId, userId)`, `rate(courseId, payload)`, `getProgress(courseId)`. Constructor takes `request` + `authHeader` (optional for public endpoints). |
| 4    | `src/api/lesson.api.ts` | `LessonApi` with: `getLessons(courseId)`, `getTitles(courseId)`, `getPreview(courseId)`, `getContent(courseId, lessonId)`, `complete(courseId, lessonId, userId)`. Constructor takes `request` + `authHeader`.                         |
| 5    | `src/api/funds.api.ts`  | `FundsApi` with: `getFunds(userId)`, `updateFunds(userId, amount)`, `getHistory(userId)`. Constructor takes `request` + `authHeader`. Migrate typed returns from current `src/helper/funds.ts`.                                        |

**Implementation detail for auth methods:** methods that don't require auth (e.g. `getAll()`, `getPreview()`,  
`getPublicProfile()`) should work even when `authHeader` is not provided — simply don't attach the header.

Example `UserApi`:

```ts
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext } from '@playwright/test';

export class UserApi {
  constructor(
    private request: APIRequestContext,
    private authHeader: string,
  ) {}

  async getProfile(userId: number) {
    return this.request.get(apiUrls.getUserProfileUrl(userId), {
      headers: { Authorization: this.authHeader },
    });
  }

  async updateProfile(userId: number, payload: object) {
    return this.request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: this.authHeader },
      data: payload,
    });
  }

  async changePassword(userId: number, payload: object) {
    return this.request.put(apiUrls.updateUserPasswordUrl(userId), {
      headers: { Authorization: this.authHeader },
      data: payload,
    });
  }

  async deactivate(userId: number, payload: object) {
    return this.request.post(apiUrls.deactivateUserUrl(userId), {
      headers: { Authorization: this.authHeader },
      data: payload,
    });
  }

  async getPublicProfile(userId: number) {
    return this.request.get(apiUrls.getPublicUserProfileUrl(userId));
  }
}
```

### Step 6 — Migrate tests to use API clients

Do this **one test file at a time**, in order from simplest to most complex:

| Sub-step | Test file                         | What changes                                                                                                       |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 6a       | `tests/api/crud/login.spec.ts`    | Create `new AuthApi(request)` at the top. Replace `request.post(apiUrls.loginUrl, ...)` → `authApi.login(...)`.    |
| 6b       | `tests/api/crud/register.spec.ts` | Same `AuthApi`. Replace `request.post(apiUrls.registerUrl, ...)` → `authApi.register(...)`.                        |
| 6c       | `tests/api/crud/courses.spec.ts`  | Create `CourseApi`. Replace raw GETs/POSTs with `courseApi.getAll()`, `courseApi.getById()`, etc.                  |
| 6d       | `tests/api/crud/lessons.spec.ts`  | Create `LessonApi` + `CourseApi` (for enroll). Replace raw calls.                                                  |
| 6e       | `req-007-funds.spec.ts`           | Create `FundsApi`. Replace calls from `src/helper/funds.ts` function style with `fundsApi.getFunds(...)` etc.      |
| 6f       | `req-017-demo-preview.spec.ts`    | Create `LessonApi` + `CourseApi`. Replace raw enroll + getLessons + getContent calls.                              |
| 6g       | `req-003-progress.spec.ts`        | Create `LessonApi` + `CourseApi`. Replace the raw `request.post(loginUrl, ...)` call with `authApi.login(...)`.    |
| 6h       | `req-019-public-profile.spec.ts`  | Create `UserApi`. Replace `request.put(apiUrls.putUserProfileUrl(...), ...)` with `userApi.updateProfile(...)`.    |
| 6i       | `req-011-user-profile.spec.ts`    | Create `UserApi` + `AuthApi`. This test has the **most** raw calls (8+), so the cleanup will be most visible here. |

### Step 7 — Clean up old helpers that are now redundant

After all tests use API clients, evaluate which `src/helper/*.ts` files can be:

- **deleted** — if the API client covers them entirely (e.g. `funds.ts`, `preview.ts`)
- **kept as compositions** — if they orchestrate multiple API calls (e.g. `enrollAndGetFirstLessonId`  
  remains useful as it calls enroll + getLessons + extracts first lesson ID)
- **simplified** — e.g. `createUserAndLogin` in `user.ts` could use `AuthApi` internally

Expected outcome:

| Helper file          | Action                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `funds.ts`           | Delete — `FundsApi` replaces it                                                                                                         |
| `preview.ts`         | Delete — `LessonApi.getPreview()` replaces it                                                                                           |
| `progress.ts`        | Keep — it does filtering logic (`find`) on top of raw response                                                                          |
| `complete-lesson.ts` | Delete — `LessonApi.complete()` replaces it                                                                                             |
| `enroll.ts`          | Refactor — `enrollInCourse()` → `CourseApi.enroll()`, keep `enrollAndGetFirstLessonId()` as composition using API clients               |
| `auth.ts`            | Refactor — `loginAndGetUser()` stays as composition (login + status + extract userId). Internally uses `AuthApi`                        |
| `user.ts`            | Refactor — `createUserAndLogin()` stays (fixture uses it). Internally uses `AuthApi`. Remove `getPublicUserProfileJson()` (→ `UserApi`) |
| `restore.ts`         | Keep — standalone system action, no domain API equivalent                                                                               |

---

## Part 2 — Assertion helpers

### Why

The pattern below appears in **nearly every test**:

```ts
expect(res.status()).toBe(HTTP_STATUS.OK);
const json = await res.json();
expect(json.success).toBe(true);
```

Found in: `req-011` (4×), `req-019` (2×), `req-007` (3×), `courses.spec` (1×), `lessons.spec` (1×), `login.spec` (2×), `register.spec` (1×).

Extracting this removes copy-paste and makes tests read like a scenario.

### Step-by-step

| Step | What to do                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| 1    | Create `src/utils/assertion.util.ts`                                                                                     |
| 2    | Add `expectStatus(response, expectedStatus)` — asserts status code, returns `response` for chaining                      |
| 3    | Add `expectSuccessResponse(response)` — asserts HTTP 200 + `json.success === true`, returns parsed JSON                  |
| 4    | Add `expectErrorResponse(response, expectedStatus)` — asserts given status + `json.error` is truthy, returns parsed JSON |
| 5    | Migrate tests file-by-file, replacing inline assertion blocks with one-liners                                            |

Example:

```ts
// src/utils/assertion.util.ts
import { HTTP_STATUS } from './http-status';
import { expect } from '@playwright/test';
import { APIResponse } from '@playwright/test';

export async function expectSuccessResponse(response: APIResponse) {
  expect(response.status()).toBe(HTTP_STATUS.OK);
  const json = await response.json();
  expect(json.success).toBe(true);
  return json;
}

export async function expectErrorResponse(
  response: APIResponse,
  expectedStatus: number,
) {
  expect(response.status()).toBe(expectedStatus);
  const json = await response.json();
  expect(json.error).toBeTruthy();
  return json;
}
```

Before:

```ts
const changePassword = await request.put(apiUrls.updateUserPasswordUrl(userId), { ... });
expect(changePassword.status()).toBe(HTTP_STATUS.OK);
const changePasswordJson = await changePassword.json();
expect(changePasswordJson.success).toBe(true);
```

After:

```ts
const changePasswordRes = await userApi.changePassword(userId, payload);
await expectSuccessResponse(changePasswordRes);
```

---

## Part 3 — Unify auth flow in tests

### Problem

There are currently **3 ways** to do authentication in tests:

1. **`loggedUser` fixture** — registers + logs in, provides `{ authHeader, userId, username, password }`
2. **`loginAndGetUser(request, data)`** — helper function for re-login scenarios
3. **Raw `request.post(apiUrls.loginUrl, ...)`** — inline in tests

This inconsistency makes the tests harder to follow and debug.

### Rules to establish

| Scenario                    | Use                                                          |
| --------------------------- | ------------------------------------------------------------ |
| Test needs auth for actions | `loggedUser` fixture (standard path)                         |
| Test needs to re-login      | `authApi.login(...)` via the API client (replaces raw calls) |
| Test needs a second user    | `createUserAndLogin()` helper (registers + logs in)          |
| Test validates login itself | `authApi.login(...)` (since login IS the thing being tested) |

### Where to fix

| File                  | Current issue                                             | Fix                                                                 |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `req-011` test 1      | Raw `request.post(loginUrl, ...)` for relogin             | `authApi.login(...)` or `loginAndGetUser(...)` (composition helper) |
| `req-011` test 2      | Raw `request.post(loginUrl, ...)` to verify new password  | `authApi.login(...)`                                                |
| `req-011` test 4      | Raw `request.post(loginUrl, ...)` to verify blocked login | `authApi.login(...)`                                                |
| `req-003` test 2      | Raw `request.post(loginUrl, ...)` for relogin check       | `authApi.login(...)`                                                |
| `courses.spec` test 6 | Raw `request.post(loginUrl, ...)` for setup               | `authApi.login(...)` or use `loggedUser` fixture                    |

---

## Part 4 — Variable naming discipline

### Problem

Several tests name an `APIResponse` as if it were an action:

```ts
const changePassword = await request.put(...)     // ← is this a function or a response?
const enrollUser = await request.post(...)         // ← same confusion
const setToPublic = await request.put(...)         // ← same
const loginNewPassword = await request.post(...)   // ← same
const loginAgain = await request.post(...)         // ← same
```

### Convention to apply

- Response variables end with `Res`: `changePasswordRes`, `enrollRes`, `loginRes`
- Parsed JSON variables end with `Json`: `changePasswordJson`, `loginJson`
- Or simply use `response` / `json` when there's no ambiguity within a block

### Where to fix

| File                             | Variable to rename                                 |
| -------------------------------- | -------------------------------------------------- |
| `req-011-user-profile.spec.ts`   | `changePassword` → `changePasswordRes`             |
|                                  | `loginNewPassword` → `loginNewPasswordRes`         |
|                                  | `loginWithOldPassword` → `loginWithOldPasswordRes` |
|                                  | `loginAgain` → `loginAgainRes`                     |
|                                  | `profileAfter` → `profileAfterRes`                 |
| `req-019-public-profile.spec.ts` | `setToPublic` → `setToPublicRes`                   |
|                                  | `getPublicUser` → `publicProfileRes`               |
| `req-017-demo-preview.spec.ts`   | `enrollUser` → `enrollRes`                         |
|                                  | `getLessons` → `lessonsRes`                        |
|                                  | `getContent` → `contentRes`                        |
| `req-003-progress.spec.ts`       | `login` → `loginRes`                               |
|                                  | `getLesson` → `previewRes`                         |
| `courses.spec.ts`                | `response` naming is already OK in most places     |
| `lessons.spec.ts`                | `getContext` → `contentRes`                        |

---

## Part 5 — Magic strings → named constants

### Problem

Hard-coded strings in test data:

```ts
currentPassword: 'zawszeSieWywali'; // req-011 test 3
```

### Fix

Add to `src/test-data/user.profile.data.ts`:

```ts
export const INVALID_PASSWORD = 'invalid-password-for-testing';
```

Use in test:

```ts
const badPassword = {
  currentPassword: INVALID_PASSWORD,
  newPassword: faker.internet.password(),
};
```

---

## Part 6 — Explicit AAA comments in complex tests

### Why

When a test has 10+ lines, it becomes hard to see where setup ends, action starts,  
and verification begins. Adding simple `// Arrange`, `// Act`, `// Assert` comments  
costs nothing and dramatically helps readability when scanning tests.

### Where to apply

Only in tests with **mixed setup + action + verification** that span 15+ lines.  
Short tests (e.g. a single call + one assertion) don't need this.

Target files:

- `req-011-user-profile.spec.ts` — all 4 tests
- `req-003-progress.spec.ts` — tests 1 and 2
- `req-017-demo-preview.spec.ts` — test 2 ("should show more content")
- `req-019-public-profile.spec.ts` — tests 1 and 2

Example for REQ-011 test 2 ("should change password"):

```ts
test('REQ-011 should change password with valid current password @logged', async ({
  request,
  loggedUser,
}) => {
  const userApi = new UserApi(request, loggedUser.authHeader);
  const authApi = new AuthApi(request);
  const { userId, username, password } = loggedUser;

  // Arrange
  const newPassword = faker.internet.password();
  const payload = { currentPassword: password, newPassword };

  // Act
  const changePasswordRes = await userApi.changePassword(userId, payload);

  // Assert — password change succeeded
  await expectSuccessResponse(changePasswordRes);

  // Assert — new password works
  const loginNewRes = await authApi.login({ username, password: newPassword });
  expect(loginNewRes.status()).toBe(HTTP_STATUS.OK);
  const loginNewJson = await loginNewRes.json();
  expect(loginNewJson.access_token).toBeTruthy();

  // Assert — old password rejected
  const loginOldRes = await authApi.login({ username, password });
  expect(loginOldRes.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
});
```

---

## Part 7 — Response schema validation (optional, advanced)

### Problem

Currently tests verify individual fields:

```ts
expect(json.success).toBe(true);
expect(typeof publicUserJson.firstName).toBe('string');
```

This catches missing/wrong values but NOT unexpected shape changes  
(e.g. a field renamed from `firstName` to `first_name`).

### Approach

Use **Zod** for lightweight runtime schema validation.

| Step | What to do                                                                            |
| ---- | ------------------------------------------------------------------------------------- |
| 1    | `npm install zod`                                                                     |
| 2    | Create `src/schemas/` directory with schema files per domain                          |
| 3    | Start with **one** schema (e.g. `public-profile.schema.ts`) and apply it in `req-019` |
| 4    | Gradually add schemas for other responses                                             |

Example:

```ts
// src/schemas/public-profile.schema.ts
import { z } from 'zod';

export const publicProfileSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string(),
  joinDate: z.string(),
  role: z.string(),
  enrollments: z.array(z.unknown()),
  certificates: z.array(z.unknown()),
  ratings: z.array(z.unknown()),
});
```

In test:

```ts
const json = await publicProfileRes.json();
const parsed = publicProfileSchema.parse(json); // throws ZodError if shape is wrong
expect(parsed.id).toBe(userId);
```

**This replaces** the 8-line `typeof` check block in `req-019` test 1 with one line.

### Priority

This is a **nice-to-have** improvement. Do it after Parts 1–6 are complete.  
Start with the test that has the most `typeof` checks (`req-019` test 1 has 8).

---

## Part 8 — Optimize `beforeEach` restore (consider, don't rush)

### Current state

Every test in every `describe` block runs `await restoreSystem(request)` in `beforeEach`.  
With `fullyParallel: true` this means N restore calls per suite.

### Options to consider

| Option                             | Pros                          | Cons                                  |
| ---------------------------------- | ----------------------------- | ------------------------------------- |
| Keep `beforeEach` (current)        | Full test isolation           | Slowest — one restore per test        |
| Move to `beforeAll`                | One restore per suite         | Tests can pollute each other          |
| Use fixture users (current)        | Each test gets its own user   | Restore still needed for seeded data  |
| Remove restore from business tests | Fixture users are independent | Risky if tests depend on seeded state |

### Recommendation

**Do not change this now.** The current approach guarantees isolation, which is critical  
while the test suite is still evolving. Revisit when:

- the test suite takes noticeably long (> 2 min for API tests)
- you're confident no test relies on a specific seeded state

If you do optimize later, the safest path is: keep `beforeEach` restore **only** in CRUD tests  
(which use seeded `testUser1`), and remove it from business tests (which use fixture users  
with `createUserAndLogin`).

---

## Execution priority

| Priority | Part   | Description           | Effort  | Impact      |
| -------- | ------ | --------------------- | ------- | ----------- |
| 1        | Part 1 | API Client classes    | High    | Highest     |
| 2        | Part 2 | Assertion helpers     | Low     | High        |
| 3        | Part 3 | Unify auth flow       | Low     | Medium      |
| 4        | Part 4 | Variable naming       | Low     | Medium      |
| 5        | Part 5 | Magic strings         | Minimal | Low         |
| 6        | Part 6 | AAA comments          | Minimal | Medium      |
| 7        | Part 7 | Zod schema validation | Medium  | Medium-High |
| 8        | Part 8 | Optimize restore      | Medium  | Risky       |

**Rule of thumb:** finish Part 1 fully (all 5 API classes + all test migrations + helper cleanup)  
before starting Part 2. Then Parts 2–6 can be done together in a single pass through each test file.  
Part 7 is a separate initiative. Part 8 — only if execution time becomes a problem.
