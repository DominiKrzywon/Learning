# Refactor Plan

## Part 1 — Remove assertions from helpers

**Rule:** helpers = actions / data fetching. Tests = assertions.  
After each step run: `npx playwright test <file> --project=api`

### Execution order

| Step | File                             | What to do                                                                                                  |
| ---- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1    | `src/helper/restore.ts`          | Remove `expect`. Return `APIResponse` or throw `new Error(...)` if restore fails.                           |
| 2    | `src/helper/auth.ts`             | Remove all 4 `expect()` calls in `loginAndGetUser`. Return raw data; throw `new Error` if token is missing. |
| 3    | `src/helper/user.ts`             | Remove `expect(registerRes.status()).toBe(200)`. Step 2 covers the login part.                              |
| 4    | `src/helper/complete-lesson.ts`  | Remove `expect`. Change return type from `void` to `APIResponse`.                                           |
| 5    | `src/helper/enroll-lesson.ts`    | Remove both `expect()` calls. Return `lessonId` as before.                                                  |
| 6    | `tests/api/crud/courses.spec.ts` | Remove `expect` from the local `enrollUserInCourse()` function.                                             |
| 7    | `tests/api/crud/lessons.spec.ts` | Same as step 6.                                                                                             |
| 8    | `tests/api/crud/login.spec.ts`   | Replace inline restore in `beforeEach`/`afterEach` with `restoreSystem()` helper.                           |

---

## Part 2 — Additional improvements

### A — Magic numbers → named constants

`courseId = 1`, `courseId = 4`, `courseId = 9999` are hardcoded in multiple test files.

Create `src/test-data/course.data.ts`:

```ts
export const courseData = {
  defaultCourseId: 1,
  playwrightCourseId: 4,
  nonExistentCourseId: 9999,
} as const;
```

---

### B — `userProfileData.currentPassword` coupling

`src/test-data/user.profile.data.ts` sets `currentPassword: testUser1.password`.  
Business tests use fixture users with random passwords, so this value is always overridden anyway.

Options:

- Remove `currentPassword` from the data object entirely.
- Or convert `userProfileData` to a factory function that accepts `password` as a parameter.

---

### C — Consistent restore pattern in CRUD tests

Currently inconsistent:

- `login.spec.ts` — inline restore in both `beforeEach` and `afterEach`
- `register.spec.ts` — no restore at all
- `courses.spec.ts`, `lessons.spec.ts` — use `restoreSystem()` in `beforeEach` (correct)

Unify all CRUD tests: use `restoreSystem()` in `beforeEach` only.

---

### D — Deduplicate `enrollUserInCourse`

There are 3 separate implementations:

1. `src/helper/enroll-lesson.ts` → `enrollAndGetFirstLessonId()`
2. `tests/api/crud/courses.spec.ts` → local `enrollUserInCourse()`
3. `tests/api/crud/lessons.spec.ts` → local `enrollUserInCourse()`

Extract a shared `src/helper/enroll.ts` with a simple `enrollInCourse()` action (no assertions, returns `APIResponse`).  
Keep `enrollAndGetFirstLessonId()` as a composition of enroll + get lessons.

---

### E — Typed JSON extraction

Helpers like `funds.ts` and `preview.ts` return raw `APIResponse`.  
Consider adding typed JSON helpers, e.g.:

```ts
export async function getUserFundsJson(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<GetFundsResponse> {
  const res = await request.get(apiUrls.getUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
  });
  return res.json();
}
```

Benefits: autocomplete in tests, compile-time shape validation.

---

### F — Missing `@logged` tags

Several tests that require authentication are missing the `@logged` tag (some in `req-003`, `req-007`).  
Apply `@logged` to all tests that use `loggedUser` fixture or `authHeader`.

---

### G — Test naming consistency

Plan rule: _use `should ...` naming style with `REQ-xxx` prefix_.

Examples to fix in `req-003-progress.spec.ts`:

- `"REQ-003 progress calculation, modification"` → `"REQ-003 should track progress after lesson completion"`
- `"REQ-003 check progress after logout"` → `"REQ-003 should persist progress after relogin"`
- `"REQ-003 complete lesson for non-enrolled course returns error"` → `"REQ-003 should reject lesson completion for non-enrolled course"`

Review all business spec files for similar naming inconsistencies.

---

### H — Remove dead code: `AuthApi` class

`src/auth.api.ts` defines an `AuthApi` class that is never imported anywhere.  
Either integrate it as the primary login abstraction, or delete it.

---

## Suggested priority

1. **Part 1** — assertions out of helpers (stated goal)
2. **D** — deduplicate enroll (directly related)
3. **C** — consistent restore (directly related)
4. **F + G** — tags and naming (low effort, brings compliance with plan rules)
5. **B** — `userProfileData` coupling (prevents future bugs)
6. **A** — magic numbers (readability)
7. **H** — dead code cleanup
8. **E** — typed responses (nice to have, bigger scope)
