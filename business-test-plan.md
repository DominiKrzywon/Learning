# Business API Test Plan

## Scope

This plan focuses only on business API scenarios and the mapping in `cases.md`.

Target scenario files:

- `req-003-progress` — **DONE** (3 tests)
- `req-007-funds` — **DONE** (3 tests)
- `req-011-user-profile` — **DONE** (4 tests)
- `req-017-demo-preview` — **DONE** (4 tests)
- `req-019-public-profile` — TODO

## Scenario Rules

- At least 3 tests per file.
- At least 1 positive and 1 negative test.
- Each test should verify business impact, not only status code.
- No test-to-test dependency.
- Test names must use the `REQ-xxx` prefix.
- Use `should ...` naming style (e.g. `REQ-017 should return preview lessons without authentication`).
- Tag tests requiring login with `@logged`.

## Technical Rules

- Use `beforeEach` + system restore for state-changing tests.
- Use shared fixtures/helpers for authentication.
- Keep assertions domain-focused (before/after state validation).
- Keep test data isolated for parallel execution.


## Execution Workflow

1. Implement one scenario file.
2. Run only that file.
3. Fix failures until stable.
4. Move to the next file.

Run command:

```bash
npx playwright test tests/api/business/<file-name>.spec.ts --project=api
```

## Quality Checklist

- Would this test catch a business regression?
- Can the file pass repeatedly without flakes?
- Is the business intent clear for a new team member?
