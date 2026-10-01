
# VOID v24 — authentication backend

## What was added

- Node.js + Express backend
- SQLite database (`void.db`)
- `users` table
- account registration
- duplicate username/email protection
- password hashing with Node `crypto.scrypt`
- login against the saved account
- local user persistence for the prototype UI

## Run locally

1. Install Node.js.
2. In this folder run:

```bash
npm install
npm start
```

3. Open:

`http://localhost:3000`

Do NOT open `index.html` directly with `file://` if you want registration/login to work.

## Important production upgrade

The prototype currently saves only the non-sensitive user profile in localStorage after login. Passwords are never stored in localStorage and are stored in the database as salted scrypt hashes.

Before public launch, replace the prototype login state with secure server-side sessions using an HttpOnly, Secure, SameSite cookie, add rate limiting, email verification, password reset, CSRF protection where applicable, HTTPS, backups, logging and proper secrets/environment configuration.

The `/api/auth/users` endpoint is development-only and must be removed before production.
