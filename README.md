# Textory

Learn languages through illustrated stories. A story is a sequence of scenes;
each scene is one clear action paired with one short sentence in the language
being learned. The artwork exists to make that sentence understandable and
memorable.

**Phase 1** built the cinematic landing hero, the onboarding shell and the
responsive/PWA foundation. **Phase 2** built the product around it: navigation,
category discovery, the story catalogue, and the story detail page.

There is still no backend, authentication, subscription, reader engine or CMS.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
- **Framer Motion** — entrance choreography, scroll reveals, pointer parallax
- **PWA-ready** — web manifest, theme colour, installable icons, shell service worker

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

## Routes

| Route                   | What it is                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| `/`                     | Hero → Explore stories → story shelves → How it works → mobile → footer |
| `/stories`              | Full catalogue: search, level pills, genre/length/sort, grid      |
| `/stories/[slug]`       | Story detail page (18 prerendered)                                |
| `/onboarding`           | Two-step language setup + confirmation                            |
| `/pricing`              | Placeholder so the nav item is not a dead link                    |
| `/manifest.webmanifest` | Generated from `app/manifest.ts`                                  |

## Data

Everything the product renders comes from `lib/catalog/`. No component holds
story metadata of its own.

```
lib/catalog/
  types.ts      Story, Level, LevelBand, GenreId, LengthBucket, StoryProgress
  stories.ts    the 18 demo stories
  taxonomy.ts   level bands, genres, length buckets, featured genre ids
  progress.ts   MOCK_PROGRESS — set to [] to preview the signed-out homepage
  queries.ts    every derived view (rows, filters, related, progress ratios)
  index.ts      barrel
```

A `Story` carries `id, title, level, genre, minutes, scenes, cover, heroScene?,
description, vocabulary, addedAt, premium?`.

`cover` and `heroScene` are deliberately separate assets. `cover` is the
catalogue thumbnail used by cards, grids and the detail page. `heroScene` is a
frame chosen from inside the story specifically for the animated homepage hero,
which needs something wide and atmospheric that reads behind moving type. The
hero resolves `story.heroScene ?? story.cover`, so a story without a dedicated
scene still renders.

**Level and genre are separate dimensions.** A story is "B1 + Mystery"; a level
is never treated as a genre. The catalogue filters and the navigation menu both
reflect that.

### Swapping in real artwork

`cover` and `heroScene` are the only links to images. Point them at new files in
`public/stories/` — any raster format — and every surface updates: `cover`
drives the category cards, story cards, grid and detail page; `heroScene` drives
the animated homepage hero. Nothing else changes.

In dev, delete `.next/cache/images` after replacing a file so the image
optimizer picks up the new bytes.

## Authentication

Supabase Auth, wired through `@supabase/ssr` so the session lives in cookies and
is readable from both the browser and the server.

```
lib/supabase/config.ts    URL + publishable key, and `isSupabaseConfigured`
lib/supabase/client.ts    browser client (cookie-backed session)
lib/supabase/server.ts    server client, used by the OAuth callback
lib/supabase/session.ts   cookie refresh, called from proxy.ts
lib/auth/providers.ts     Google · Apple · Facebook
lib/auth/redirects.ts     every redirect decision, in one place
app/auth/callback/        exchanges the OAuth code for a session
app/login/                the sign-in page
components/auth/          AuthProvider, HeaderAuth, AccountMenu, LoginPanel
```

**The site runs fine without credentials.** Every auth path checks
`isSupabaseConfigured` first; with no `.env.local` the catalogue, hero and
onboarding work exactly as before and `/login` explains that sign-in is not
connected yet. Nothing throws.

**Redirects** all resolve through `lib/auth/redirects.ts`. When the learning
dashboard exists, changing `POST_SIGN_IN_PATH` is the only edit needed to send
people there after signing in.

### Setup

1. Create a Supabase project and copy `.env.example` to `.env.local`, filling in
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. In Supabase → Authentication → URL Configuration, allow-list
   `http://localhost:3000/auth/callback` and the production equivalent.
3. In Supabase → Authentication → Providers, enable Google, Apple and Facebook
   and paste each provider's client id/secret.
4. In each provider console, register the redirect URI
   `https://<project-ref>.supabase.co/auth/v1/callback`.

Provider secrets live in the Supabase dashboard, not in this repo — the app
never sees them.

## Component architecture

```
components/
  nav/
    CategoryMenu.tsx        desktop mega-menu: By level | By genre
    MobileNavSheet.tsx      < lg navigation overlay
  landing/
    SiteHeader.tsx          one header, audience-aware
    Hero.tsx                >= md hero (Phase 1, unchanged behaviour)
    MobileHero.tsx          < md hero
    CategoryDiscovery.tsx   "Explore stories" section
    CategoryCard.tsx        one large genre card
    StoryRows.tsx           the homepage shelves, composed from queries
    HowItWorks.tsx          the method in three beats
    MobileShowcase.tsx      supporting web+mobile section
    SiteFooter.tsx
  story-ui/
    StoryCard.tsx           the catalogue atom
    StorySection.tsx        one horizontal shelf (renders null when empty)
    StoryGrid.tsx           4 / 3 / 2 / 1 column responsive grid
    StoryFilters.tsx        search, level pills, genre/length/sort
    StoryDetail.tsx         the story landing surface
    StoryMeta.tsx           "B1 · Mystery · 8 min" + PremiumBadge
  story/                    Phase 1 hero motion system (unchanged)
    FloatingStoryCard.tsx   FloatingStoryScene.tsx
    AnimatedStoryBackground.tsx  FloatingGreeting.tsx  AmbientGlow.tsx
  app/SplashScreen.tsx      the app opening screen (mobile hero + mockups)
  device/PhoneFrame.tsx     renders live screens, not screenshots
  onboarding/  brand/  ui/  pwa/
```

## Navigation

`lib/navigation.ts` defines navigation per audience:

- `PUBLIC_NAV` — Stories · Categories · How it works · Pricing, plus Sign in and
  Get Started
- `MEMBER_NAV` — Home · Stories · Saved · My Learning (shape only; not routed)

`SiteHeader` takes an `audience` prop that is hard-wired to `"public"`. When
accounts exist, the signed-in shell passes `"member"` and nothing else about the
header changes.

Breakpoints: full centre nav from `lg`; menu button below `lg`; `Get Started`
from `md`. On the homepage the small-screen bar stays hidden until the reader
scrolls past the full-bleed splash, which carries its own branding.

## The floating story cards (Phase 1, preserved)

Each hero card is its own component instance — never a baked background image.
`FloatingStoryCard` takes position, width, aspect, rotation, 3-D lean, depth,
drift direction/distance, three durations and a delay. Motion is a nested stack
where every layer animates **transform only**:

1. `motion.div` — placement + springed pointer parallax
2. `.drift-x` — horizontal oscillation (CSS, `alternate`)
3. `.drift-y` — vertical oscillation (CSS, `alternate`)
4. `.drift-rotate` — rotation sway (CSS, `alternate`)
5. the visual — artwork, depth veil, rim light, static base tilt

The three periods are non-harmonic (17–59 s) and every card carries its own
negative `animation-delay`, so the composed path is a Lissajous curve with no
perceivable loop point. `prefers-reduced-motion: reduce` switches every ambient
animation off; the base tilt is a static transform, so the composition keeps its
designed pose and simply stops moving.

The hero cards now reference real catalogue stories by id, so they inherit
whatever cover art those stories have.

## Responsive behaviour

- **< 768px** — app-style splash hero; single-column grid; filters wrap; phone
  mockups reduce to one.
- **768–1023px** — stacked hero; 2-column grid; menu button replaces the centre nav.
- **≥ 1024px** — two-column hero, 3-up category cards, 3-column grid, mega-menu.
- **≥ 1280px** — 4-column story grid.

Verified with no horizontal overflow at 390 / 768 / 1440 / 1920.

## Still placeholder

- **Story artwork** — the eight SVGs in `public/stories/` are temporary, and
  several stories share a cover. Replace per the swap note above.
- **Story metadata** — all 18 stories are fictional demo content.
- **Progress** — `MOCK_PROGRESS` is a hard-coded list, not per-user state.
- **Visual-only controls** — Sign in, Start/Continue Story, Save for later,
  Get the App. They render but do nothing; the reader and auth do not exist yet.
- **`/pricing`** — deliberately minimal. No plans, billing or payments.

