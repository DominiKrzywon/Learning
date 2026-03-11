# API Business Cases

## Current CRUD Baseline

- Authentication: login, register, auth status
- Courses: list, details, ratings, progress
- Lessons: list, titles, preview, content, complete

## Business Case Map

Priority legend:

- `P0`: current focus
- `P1`: next phase
- `P2`: backlog

### REQ-001 User Registration and Authentication (P0)

Goals:

- Validate registration inputs
- Validate login success and failure
- Validate session status/logout flow
  Endpoints:
- `POST /api/learning/auth/register`
- `POST /api/learning/auth/login`
- `GET /api/learning/auth/status`
- `POST /api/learning/auth/logout`

### REQ-003 Progress Tracking (P0)

Goals:

- Validate progress calculation
- Validate progress update after lesson completion
- Validate progress persistence after relogin
  Endpoints:
- `GET /api/learning/courses/{courseId}/progress`
- `POST /api/learning/courses/{courseId}/lessons/{lessonId}/complete`

### REQ-007 Funds (P0)

Goals:

- Validate balance before and after update
- Validate transaction history entry
- Validate out-of-range amount rejection
  Endpoints:
- `GET /api/learning/users/{userId}/funds`
- `PUT /api/learning/users/{userId}/funds`
- `GET /api/learning/users/{userId}/funds/history`

### REQ-011 User Profile Management (P0)

Goals:

- Validate profile read and update
- Validate password change (positive and negative)
- Validate account deactivation
  Endpoints:
- `GET /api/learning/users/{userId}`
- `PUT /api/learning/users/{userId}/profile`
- `PUT /api/learning/users/{userId}/password`
- `POST /api/learning/users/{userId}/deactivate`

### REQ-017 Free Demo Preview (P0)

Goals:

- Validate preview access without login
- Validate preview scope vs full lesson content
  Endpoints:
- `GET /api/learning/courses/{courseId}/lessons/preview`
- `GET /api/learning/courses/{courseId}/lessons/{lessonId}/content`

### REQ-019 Public User Profile (P0)

Goals:

- Validate public profile access without login
- Validate sensitive data is not exposed
  Endpoint:
- `GET /api/learning/public/users/{userId}`

### P1/P2 Backlog

- REQ-005 Assessment System (P1)
- REQ-013 Instructor Dashboard (P1)
- REQ-014 Search and Filtering (P1)
- REQ-015 Rating and Feedback System (P1)
- REQ-018 Free Course Access (P2)
- REQ-021 Course Tags System (P2)

## Out of API-Only Scope

- REQ-010 Mobile Responsiveness
- REQ-016 Accessibility Features
- UI-only parts of REQ-020
