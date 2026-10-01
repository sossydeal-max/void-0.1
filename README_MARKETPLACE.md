
# VOID MARKETPLACE — v20 concept

This is a visual/interaction prototype for the next stage of VOID.

## Main frontend file
`index.html` is the main page/entry point of the current prototype.

## Frontend behavior
`app.js` contains the prototype interactions.

## Current concept
- independent creator accounts
- creator profiles
- marketplace discovery
- beats / sound kits / loops / MIDI / presets
- creator dashboard
- upload flow concept
- account modal

## Important
This is NOT yet a real marketplace backend. Accounts, authentication, file uploads,
database records, payment processing, creator payouts, protected downloads,
moderation and real order handling must be implemented on a server.

## Planned real architecture

Frontend:
- `index.html` / later a proper app router
- `app.js`

Backend:
- `server.js` (or equivalent server entry)
- API routes for auth, users, products, orders, licenses, uploads and payouts

Database:
- users
- creator_profiles
- products
- product_files
- licenses
- orders
- order_items
- payouts
- reviews
- reports

Storage:
- audio files
- ZIP/sample packs
- cover images

Payments:
- payment provider + webhook handling
- seller balance/payout system

## v21 guest mode
The marketplace is public on entry. Visitors are not forced into registration. Authentication opens only after CREATE ACCOUNT or SIGN IN is selected.

## v23 guest-first entry
The authentication modal is explicitly hidden on initial page load. It can only be opened by CREATE ACCOUNT or SIGN IN.
