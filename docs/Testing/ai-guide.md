# AI Guide - Testing

Checklists for working on the e2e suite. See <a href='./e2e.md' target='_blank'>End-to-end tests</a> for the setup, the file layout and the seeded users.

&nbsp;

## Before writing a test

1. Find the file it belongs to - files are numbered by flow (admin CRUD in 01-07, user 0 in 08, the other users in 09). A new flow gets the next number.
2. Check what earlier files did to the data you need (creates in 02/04, updates in 06, soft deletes in 07). Compare with the admin's result for the same query rather than hardcoding values.
3. Use the helpers in `common/e2e.common.ts` and the types in `common/e2e.common.definitions.ts`.
4. No `expect` inside conditionals - check the individual properties of the affected items.

&nbsp;

## When a test fails

1. Read `logs/app_logs_<NODE_ENV>.txt` - access control, authentication and data errors are all logged there.
2. Empty-body 401: the token or the route (see <a href='../Architecture/authentication.md' target='_blank'>Authentication</a>).
3. 403: find the error code in the log and walk the user's permissions in id order (see <a href='../Architecture/access-control.md' target='_blank'>Access Control</a>).
4. Passes alone, fails in the full run (or the other way round): shared data changed by an earlier file.
5. A seed or migration change has no effect: rebuild `apps/test`.
6. A user's role or relation change isn't visible: their token's user is from login time, and logging in again in the same run may still return the cached user.

&nbsp;

## Coverage

`npm run test` collects V8 coverage from the running apps into `coverage/results-data`. `npm run test:report-coverage` prints the text report and writes the HTML one to `coverage/report`. Migrations, seeds and a few generated or CLI files are excluded.
