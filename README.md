# Interview Auctions

A farm equipment auction platform. You'll fix a bug to get oriented, then build features on top of a working app.

## Prerequisites

- **Node.js** (required regardless of backend choice) — [nodejs.org/en/download](https://nodejs.org/en/download)

## Setup

### Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

### Backend — TypeScript (Express)

```bash
cd server/typescript
npm install
npm run dev
```
Runs at `http://localhost:3001`. The frontend proxies `/api` to this server.
This submission uses the TypeScript backend throughout.

## Implemented behavior

- Valid bids persist in per-listing history, newest first, with cursor pagination. Missing listings return 404; existing listings without bids return an empty history.
- Listings support page/page size, totals, next-page metadata, title search, category/status filters, and deadline/current-bid sorting.
- Cards and detail pages share a countdown with days, hours/minutes, and seconds. They close automatically at the deadline; pending and explicitly closed lots cannot receive bids.
- The API determines expiry using its own clock before accepting bids and before status filtering. The browser hides the form at expiry and checks again on submit; the API remains authoritative if a browser clock is wrong.
- `/api/events` sends server-sent notifications on bids, creation, and expiry. Each browser refreshes its current route data, preserving filters and in-progress bid input. Bid history refreshes when the leading bid changes. Expiration notifications run once per second.
- Listing creation validates equipment details, opening price, closing time, and up to four photos on both client and server. The first photo is the cover. Drafts recover from local storage; publishing opens bidding immediately.
- EventSource reconnects automatically, with a fresh-data notification on every connection to recover missed events. The page shows a connection warning during outages.

The original seed deadlines are in April 2026. After those dates, those lots correctly appear closed. Use **List your equipment** to create an active auction. The closing time defaults to seven days from creation and can be changed before publishing.

## Validation

```bash
npx playwright install chromium  # once, for browser tests
npm run check
npm run typecheck
npm run build
npm test
```

`npm run test:api` runs 14 focused tests for bids, history, listing queries, creation, countdowns, and live notifications. `npm run test:browser` runs seven browser integration tests against the real frontend and API: live bids preserve other viewers' input, auctions close without a reload, history paginates, filters survive navigation, and creation works on desktop and mobile with photos and draft recovery.

All tests use temporary data directories. Browser tests start their own API on port 3002 and Vite on port 5174; the development servers and demo listings are left alone. Both sets of backend dependencies must be installed using the setup instructions above.

## Code layout

- `src/pages`: route screens and loader data.
- `src/hooks`: effectful behavior for countdowns, history requests, search, route focus, header measurement, preview state, and live updates.
- `src/components/layout`: header, route focus, and live connection status.
- `src/components/listings`: browsing controls, cards, detail panel, and countdown labels.
- `src/components/bids`: bidding and bid history.
- `src/components/create-listing`: creation form, preview, photo preparation, and local draft storage.
- `shared`: request types, validation, query parsing, auction time rules, and regex constants.
- `server/typescript/routes`: HTTP validation and responses.
- `server/typescript/storage`: JSON persistence and uploaded photos.
- `server/typescript/app.ts`: Express setup; `index.ts` starts the listener and expiration watcher.
- `server/typescript/tests`: focused API suites and shared fixtures/accessors.
- `tests`: browser integration tests and shared form/API helpers.

Countdown ticks render only their labels; deadline changes update the surrounding card or detail once. Effects are limited to browser subscriptions, timers, route focus, DOM measurement, and abortable history requests. Form edits save drafts directly, and page titles use React's native metadata rendering.

## Scope and tradeoffs

This is a single-process demo. Bid validation and JSON writes are synchronous, so concurrent requests in that process cannot overwrite each other's accepted bids. Atomic file replacement protects an individual history write. Multiple server instances would require database transactions and shared event distribution. Bidder names are self-reported, not authenticated accounts. Browser countdowns use the local clock; bid acceptance always uses server time. Notifications trigger a fresh query so server-side sorting, filtering and pagination remain consistent.

---

## What to expect

We expect this to take 1–2 hours. Start with task 0, then work on the tasks you've been assigned.

**You can use any resource you want** — the internet, AI, documentation, anything. There are no restrictions. What matters is that you can explain what you built and why you made the choices you did. You'll walk through your code with us afterward, so make sure you understand it.

**Depth over breadth.** A well-implemented task with clear reasoning is better than several half-finished ones. Don't rush to complete more tasks at the expense of the ones you've started.

**Tests are not required.** Given the time constraint, focus on working, well-reasoned code. If writing tests helps you, go for it, but don't feel obligated.

**There are no trick questions in the tasks.** The requirements say what they mean. When something is left unspecified, that's intentional — use your judgment and be ready to explain the call you made.

---

## Committing

Commit after each task. It doesn't need to be clean — just a checkpoint so we can review your work task by task. We'll be looking at the history during the code review.

## Submission

You'll receive this project as a zip file. To submit:

1. Unzip the folder and initialize it as a git repository if it isn't already (`git init`)
2. Do your work, committing after each task as described above
3. Create a **public** repository on GitHub (or another public git host)
4. Push your code to it
5. Send us the link to your repository
