# Manual Browser Verification

## Purpose

This is the reproducible browser check for the complete React-to-Spring-Boot user journey. It
is separate from the mocked frontend tests and the live-backend contract script. The project
does not currently claim to have an automated browser E2E suite.

## Prerequisite

Start the backend and frontend with `npm start` from the repository root. Confirm these URLs
respond before beginning:

- Frontend: `http://localhost:4173`
- Report catalog API: `http://localhost:8080/api/reports`

## Ten-minute demo script

1. Open `http://localhost:4173` and confirm the Users, Departments, and Projects cards appear.
2. Search for `users`; confirm only the Users card remains. Clear the search.
3. Open Users and confirm its six required columns, `15 rows`, and `Page 1 of 3` are visible.
4. Select `Next`; confirm rows 6–10 and `Page 2 of 3` appear, then return to the first page.
   Confirm the URL contains `page=2`; use browser Back and Forward to restore each page.
5. Search the Users table for `Daniel`; confirm only Daniel Kim remains and pagination disappears.
   Refresh or copy the URL into a new tab and confirm the same filtered view is restored.
6. Clear the search and select the Name header twice; confirm server-sorted ascending and
   descending results.
7. Use `All reports`, then open Departments and confirm five required columns across 12 rows.
8. Return and open Projects; confirm seven required columns across 15 rows.
9. Refresh `/reports/projects` directly; confirm the route still renders correctly.
10. Resize to a narrow mobile width; confirm the page does not overflow and the wide table can
   scroll horizontally inside its labeled region.
11. Stop Spring Boot and refresh a report page; confirm a recoverable error and `Try again`
    appear. Restart Spring Boot, select `Try again`, and confirm the table returns.

For a visible loading state, enable browser network throttling (for example, Slow 3G) and
refresh. The empty-dataset rendering is covered deterministically by the mocked frontend test;
the seeded live backend intentionally returns non-empty datasets. A no-results state can be
demonstrated by searching for a value that does not exist.

## Recorded verification

The application was manually exercised against the real local backend on August 10, 2026.
The following journey passed, including a complete rerun after pagination was added:

- Landing-page loading, report cards, report search, and navigation
- Users, Departments, and Projects routes with their required columns and data
- Server-side pagination, row filtering, sortable columns, direct-route refresh, and back
  navigation
- Recoverable frontend behavior when the backend was unavailable
- Mobile-width table scrolling without document-level horizontal overflow
- Tablet and desktop layouts
- Browser console inspection with no application errors

This record is manual evidence, not an automated browser test. The frontend behavior suite,
backend API suite, production build, and live-backend contract check also passed. Product demos
should use a final clean-start build.
