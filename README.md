# Learning API Tests

This repository contains API tests only.
It uses Playwright's API testing capabilities (without UI test coverage) to validate Learning platform endpoints.

## What These Tests Verify

- Authentication and registration flows (`login`, `register`)
- Courses and lessons API behavior (CRUD-style scenarios and access control)
- Business requirements coverage: `REQ-003` (progress), `REQ-007` (funds), `REQ-011` (user profile), `REQ-017` (demo preview), `REQ-019` (public profile)
- Positive and negative paths, including authorization and validation errors

## Stack and Approach

- Playwright Test (`@playwright/test`) with a dedicated `api` project
- TypeScript
- Zod schemas for response contract validation
- Fixtures, factories, test data, and API helper utilities for reusable setup and assertions

## Run API Tests

```bash
npx playwright test --project=api
```
