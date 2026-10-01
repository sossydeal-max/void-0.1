# VOID by xg.com — Render deploy

This folder is the consolidated V27 marketplace prototype prepared for a first live Render test.

## Render settings
- Service type: Web Service
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: leave blank

The server already uses Render's `PORT` environment variable and binds through Express's default host behavior.

## Important for this test
The current authentication backend is still a prototype. Passwords are hashed with scrypt, but login state is returned to the frontend rather than using a production-grade HttpOnly session cookie.

SQLite is included for the test. On Render, the default filesystem is ephemeral, so database changes should NOT be treated as permanent production data. For production, move the database to managed Postgres (or configure an appropriate persistent storage strategy).

Before production:
- add secure server-side sessions with HttpOnly/Secure/SameSite cookies;
- add logout and `/api/auth/me` session endpoints;
- add rate limiting and abuse protection;
- add email verification and password reset;
- remove `/api/auth/users`;
- move production data/storage to durable infrastructure;
- add payment provider + webhooks and seller payout logic;
- configure secrets through Render environment variables.
