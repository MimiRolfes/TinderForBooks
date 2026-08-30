# PROJECT_CONTEXT.md --- Tinder for Books

## Purpose

This file describes the current state and direction of Tinder for Books
and should be updated when major features, architecture, database
structure, product direction, or the next work package changes.

## 1. Product Overview

**Tinder for Books** is a mobile-first book discovery application.

Users define what they like to read and discover individual books
through a swipe-based interface.

Core loop:

`Preferences → Discover → Swipe → Save / Read / Skip → Personal Library`

The experience should feel modern, cozy, warm, intuitive, personal,
book-focused, and mobile-first --- closer to warm evening light, a
fireplace, a blanket, paper, and reading on the couch than to a sterile
SaaS interface.

## 2. Core Features

### Home

Emotional introduction, clear product purpose, and CTA into discovery.

### Preferences

Users define reading interests such as genres and book length. The
experience should feel like creating a personal reading profile rather
than filling out a form.

### Discover / Swipe

Core product feature. Individual books are presented as swipe cards.

-   **Save / Like:** add to Wishlist.
-   **Read:** add to Read Books.
-   **Skip / Dislike:** reject and avoid recommending again where
    possible.

Swipe gestures and explicit buttons should both be supported where
appropriate.

### Wishlist

Saved books may contain title, author, cover, description/claptext,
external identifier, purchase/Amazon link, creation timestamp, and
production user ownership.

Users should be able to view saved books, remove them, and open
available purchase links.

### Read Books

Stores books already read and forms part of the user's reading history.
It may later improve recommendations.

## 3. Accounts & Authentication

Planned core account functionality: - Sign Up - Login - Logout - email +
password - username/display name - user profile

Authenticated users should have persistent: - preferences - wishlist -
read books - swipe history - profile information

Private data must belong to the authenticated user.

## 4. Guest Mode

The web version may support Guest Mode with temporary/local data. The
mobile application may eventually require authentication.

Do not assume guest and authenticated persistence behave identically.

## 5. Backend Direction

Backend platform: **Supabase**.

The previous Supabase project has expired. A new production-oriented
project is expected during the next architecture phase.

Supabase responsibilities: - authentication - PostgreSQL - Row Level
Security - profiles - preferences - wishlist - read history - swipe
history

The new schema should be user-centric from the beginning, with
user-scoped RLS for private data.

## 6. Current Frontend

The current implementation is a **React prototype** serving as: -
working product prototype - UX reference - design reference - behavioral
reference

It is not necessarily the final production client.

## 7. Flutter Migration Direction

The planned production direction is to seriously evaluate/move toward
**Flutter + Dart** for iOS, Android, and potentially Web.

Finish the React product/UX concept enough to provide a reliable
specification before migration.

Do not mechanically translate React line-by-line. Use it as product,
visual, interaction, and behavioral reference and rebuild according to
Flutter conventions.

## 8. Design Direction --- Warm Pages

The design concept is **Warm Pages**.

Useful inspiration: - Tinder-style card discovery - Reado - modern
reading apps

These are references, not designs to copy.

### Colors

-   Background: `#758695`
-   Warm light/accent: `#EEEBD9`
-   Warm card surface currently used: `#FDFAF2`
-   Warm dark text currently used: `#1C1610`

### Typography

-   Emotional headlines: **Inknut Antiqua**
-   UI, labels, body: **Inria Sans**

### Visual Principles

Prefer rounded cards, warm shadows, subtle overlays, comfortable
spacing, clear hierarchy, large touch targets, visual depth, and
book-centric presentation.

Avoid sterile pure-white SaaS layouts, excessive hard borders, oversized
desktop typography, dense forms, and generic dashboard aesthetics.

## 9. Mobile UX

This is a **mobile-only app. There is no desktop version.** Do not design,
build, or test for desktop layouts — the React prototype is a phone app
and is validated on phone viewports / the iOS Simulator only.

It should feel like an app rather than a website.

Primary mobile navigation uses bottom tabs: - Home - Discover / Swipe -
Wishlist - Read - Profile

Because iOS Safari is a target, respect `env(safe-area-inset-*)` and use
`viewport-fit=cover`; full-screen backdrops must cover the status-bar area.

## 10. Localization

Default language: **English**.

Secondary language: **German**.

The app includes an **EN / DE toggle**.

Requirements: - centralized user-facing strings - persisted language
preference - instant UI switching where possible - never mix German and
English in the same active language state

## 11. Current Implemented State

Current major state: - React routing exists - mobile-first Bottom Tab
Navigation exists - Profile placeholder exists - Warm Pages redesign has
started - Landing / "Start" screen redesigned to match the Figma "Start"
frame (cosmos background, serif hero, cream CTAs, translucent info cards,
decorative turtle doodle) - Guest Home ("Guest Home" frame) redesigned:
genre suggestion decks with real book covers, per-genre translucent card
surfaces, cream Swipe buttons - reusable `BottomNav` component
(`src/components/BottomNav.jsx`) — all four guest tabs wired: Home
(`/home-guest`), Preferences (`/guest-preferences`), Swipe
(`/guest-swipe`), Wishlist (`/guest-wishlist`) - Guest Preferences
("Guest Preferances" frame) built at `/guest-preferences`: genre chips
(multi-select), page-count radios, language chips, author input; the
Swipe CTA saves the choice via `storageService.setPreferences`
(sessionStorage) and opens the swipe deck - Guest Home genre decks: the
"Swipe" button opens `/guest-swipe` for that genre (router state) -
Guest Swipe ("Guest Swipe" frame) at `/guest-swipe`: one big card
(cover / title / blurb) with trash = skip and green-check = save; drag
left/right also works. Deck comes from the **Open Library API**
(`src/services/books.js`, no key, CORS): `fetchGuestDeck` builds it from
the tapped genre or the stored preferences (subject / author / page-count
/ language → query params); blurbs are hydrated lazily for the visible +
next card (Open Library `/works` is slow); `src/data/guestDeck.js`
(`FALLBACK_DECK`) shows when the API fails or returns nothing - Guest
Wishlist ("Guest Wishlist" frame) at `/guest-wishlist`: 2-column grid of
saved books with remove (X) + buy (cart icon → Amazon) and a "Cart"
button; reads/writes `localStorage` via `storageService` (liked +
swiped ids) - each screen sets its own status-bar colour via
`usePageTheme` (iOS Safari paints that strip in the document colour);
`viewport-fit=cover` + `env(safe-area-inset-*)` respected - shared
`LangToggle`
and `GuestTopbar` components (`src/components/`) so the EN/DE switch and
the "*Guest*" top bar are pixel-identical across guest screens; the
"*Guest*" badge looks like plain text but is the tap target back to the
Start screen (`/`) so guests can reach log in / register - Home
redesigned - Navigation
redesigned - Swipe redesigned - EN/DE localization implemented across
major screens - language
preference persists locally - Wishlist previously supported Supabase
insert, select, and delete - Wishlist model was extended with title,
author, cover, claptext, and amazonLink - old Supabase project is not
the intended production backend

## 12. Repository Hygiene

-   `.gitignore` exists
-   `node_modules` ignored
-   `.env` ignored
-   build output ignored
-   editor/system files ignored
-   old Claude worktree artifacts removed
-   development uses Git checkpoints on `main`

## 13. Current Development Phase

**Product and UX definition in the React prototype.**

Immediate objective: finish the visual and interaction concept so the
React version becomes a reliable reference for the future
implementation.

Do not over-invest in React-specific architecture expected to be
discarded during Flutter migration.

React work should primarily improve product definition, UX, visual
design, interaction behavior, and reliable reference functionality.

## 14. Planned High-Level Sequence

1.  Finish Warm Pages redesign across all React screens.
2.  Validate complete mobile UX.
3.  Validate EN/DE localization.
4.  Review React prototype as complete product/design reference.
5.  Create new Flutter project.
6.  Rebuild app shell and screens systematically in Flutter.
7.  Create new Supabase project.
8.  Design Supabase around authenticated user ownership from the
    beginning.
9.  Implement production account functionality.
10. Connect persistent Preferences, Wishlist, Read history, and Swipe
    history.
11. Test iOS, Android, and Web as applicable.

## 15. Current Architectural Principle

Do not optimize the React prototype as if it were necessarily the final
production architecture.

Its primary purpose now is to become a **clear, functioning
specification of the product**.

The Flutter implementation should follow Flutter conventions rather than
copying React architecture.

## 16. Next Work Package

Continue and complete the **Warm Pages mobile-first redesign** for the
remaining React screens.

After the redesign: - review the complete prototype - verify
localization - verify the core user flow - use the result as the
reference point for Flutter migration
