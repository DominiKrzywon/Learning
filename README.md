# Learning Test Automation (UI + API)

This repository contains automated tests for the Learning platform using Playwright and TypeScript.

It covers both:

- UI test flows (smoke, integration, e2e)
- API contract and business tests

## Application Under Test

The tested demo application comes from this repository:

- https://github.com/jaktestowac/gad-gui-api-demo

Want to quickly test the application?

1. clone or download the repository
2. run npm i
3. run npm run start
4. open http://localhost:3000 in your browser
5. enjoy testing and automating 🦎 GAD!

## What These Tests Verify

- Authentication and session behaviors
- Course enrollment and access restrictions
- Lesson completion and progress behavior
- User profile management flows
- Demo preview restrictions for guest users
- API business requirements and response contracts

## Test Stack

- Playwright Test (`@playwright/test`)
- TypeScript
- Zod schema validation for API contracts
- Fixtures, helpers, and test data for reusable setup

## Run Tests

Run all tests:

```bash
npm run test
```

Run API only:

```bash
npx playwright test --project=api
```

Run UI as guest (non-logged):

```bash
npx playwright test --project=chromium-non-logged
```

Run UI as logged user:

```bash
npx playwright test --project=chromium-logged
```
