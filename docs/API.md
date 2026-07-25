# API Reference

All endpoints are Next.js Route Handlers under `src/app/api/`, served from
the same origin as the frontend (e.g. `https://your-app.com/api/...`).

Authenticated endpoints rely on an **httpOnly session cookie**
(`srems_session`) set by `/api/auth/login`. There is no bearer token to
manage on the client — always call these endpoints with
`credentials: "include"` (the `apiClient` helper does this automatically).

All responses are JSON. Errors look like:

```json
{ "error": "Human-readable message." }
```

with an appropriate HTTP status code (`400`, `401`, `403`, `404`, `409`,
`422`, `423`, `429`, `500`).

---

## Auth — `/api/auth`

| Method | Path                          | Auth | Description |
| ------ | ------------------------------ | ---- | ----------- |
| POST   | `/api/auth/signup`             | none | Create an account (`fname, lname, email, password, phone?, role, licenceNumber?, agency?`). Sends a verification email. Does **not** log the user in. |
| POST   | `/api/auth/login`               | none | `{ email, password }`. Fails with `403 EMAIL_NOT_VERIFIED` if unverified. Locks the account for 15 min after 5 failed attempts. Sets the session cookie. |
| POST   | `/api/auth/logout`              | session | Revokes the current server-side session and clears the cookie. |
| GET    | `/api/auth/me`                  | optional | Returns `{ user }` for the current session, or `{ user: null }`. |
| POST   | `/api/auth/verify-email`        | none | `{ token }` from the emailed link. Marks the account verified. |
| POST   | `/api/auth/resend-verification` | none | `{ email }`. Re-sends the verification email (silently no-ops for unknown/verified accounts). |
| POST   | `/api/auth/forgot-password`     | none | `{ email }`. Always returns a generic success message (no user enumeration). |
| POST   | `/api/auth/reset-password`      | none | `{ token, password }`. Sets a new password and revokes all existing sessions. |

## Users — `/api/users`

| Method | Path                          | Auth | Description |
| ------ | ------------------------------ | ---- | ----------- |
| GET    | `/api/users`                    | admin | List all users. |
| GET    | `/api/users/:id`                | self or admin | Fetch one user. |
| PATCH  | `/api/users/:id`                | self or admin | Self: update `{ fname?, lname?, phone?, avatarUrl?, agency? }`. Admin: `{ isActive }` to activate/deactivate any account. |
| PATCH  | `/api/users/:id/verify-agent`   | admin | `{ approve: boolean }`. Verifies/rejects an agent's licence and notifies them. |

## Properties — `/api/properties`

| Method | Path                     | Auth | Description |
| ------ | -------------------------- | ---- | ----------- |
| GET    | `/api/properties`          | none | List/search. Query params: `keyword, type, purpose, city, status, agentId, minPrice, maxPrice, minSquareFeet, minBeds, minBaths, sortBy`. |
| POST   | `/api/properties`          | agent, admin | Create a listing. Body matches the `Property` shape (minus id/timestamps). |
| GET    | `/api/properties/:id`      | none | Fetch one property. |
| PUT    | `/api/properties/:id`      | owning agent, admin | Update a listing. |
| DELETE | `/api/properties/:id`      | owning agent, admin | Delete a listing. |

## Favorites — `/api/favorites`

| Method | Path                          | Auth | Description |
| ------ | ------------------------------ | ---- | ----------- |
| GET    | `/api/favorites`                | session | `{ properties, propertyIds }` for the current user. |
| POST   | `/api/favorites`                | customer | `{ propertyId }`. Idempotent. |
| DELETE | `/api/favorites/:propertyId`    | session | Remove a favorite. |

## Bookings — `/api/bookings`

| Method | Path                | Auth | Description |
| ------ | --------------------- | ---- | ----------- |
| GET    | `/api/bookings`        | session | Scoped automatically: customers see their own, agents see bookings on their properties, admins see all. |
| POST   | `/api/bookings`        | customer | `{ propertyId, moveInDate, notes? }`. Fails `409` if the property isn't `available`. |
| GET    | `/api/bookings/:id`    | participant, admin | Fetch one booking. |
| PATCH  | `/api/bookings/:id`    | participant (role-limited), admin | `{ status }`. Customers may only cancel their own; agents may confirm/reject/cancel/complete their own; admins may set anything. |

## Payments — `/api/payments`

| Method | Path              | Auth | Description |
| ------ | ------------------- | ---- | ----------- |
| GET    | `/api/payments`      | session | Own payments (all, for admins). |
| POST   | `/api/payments`      | customer | `{ bookingId, amount, method }`. Simulates gateway verification (~90% success) — replace with a real provider webhook for production. On success, confirms the booking and marks the property `booked`. |

## Messages — `/api/messages`

| Method | Path             | Auth | Description |
| ------ | ------------------ | ---- | ----------- |
| GET    | `/api/messages`     | session | `?with=<userId>` to filter a single conversation thread. |
| POST   | `/api/messages`     | session | `{ receiverId, propertyId?, content }`. Creates a notification for the recipient. |

## Notifications — `/api/notifications`

| Method | Path                       | Auth | Description |
| ------ | ---------------------------- | ---- | ----------- |
| GET    | `/api/notifications`          | session | Latest 50 notifications for the current user. |
| POST   | `/api/notifications`          | session | Marks all as read. |
| PATCH  | `/api/notifications/:id`      | session (owner) | Marks one as read. |
| DELETE | `/api/notifications/:id`      | session (owner) | Dismiss one. |

## Dashboard — `/api/dashboard`

| Method | Path                     | Auth | Description |
| ------ | -------------------------- | ---- | ----------- |
| GET    | `/api/dashboard/report`     | admin | Aggregated system report (user/property/booking counts, revenue, monthly breakdown) — powers the admin Reports page. |

## Misc

| Method | Path         | Auth | Description |
| ------ | -------------- | ---- | ----------- |
| GET    | `/api/tools`    | none | List maintenance tools. |

---

## Error codes reference

| Status | Meaning |
| ------ | ------- |
| 400 | Malformed JSON body |
| 401 | Not authenticated / wrong credentials |
| 403 | Authenticated but not permitted (wrong role/ownership), or email not verified |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email, property no longer available) |
| 422 | Validation failed (Zod) — message names the specific field issue |
| 423 | Account temporarily locked (too many failed logins) |
| 429 | Rate limited — try again later |
| 500 | Unexpected server/database error |
