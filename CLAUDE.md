# coney-realty — Project Standards

Real estate admin app + public marketing site. Next.js 16 (App Router) +
React 19, deployed to **Vercel** (Hobby plan — a plain `next build`, no
adapter). Backend: Supabase, with RBAC (superadmin-managed role/page/action
access) and soft deletes everywhere. Login-only auth (no self-registration;
superadmin creates/manages all user credentials).

This is a sibling of `realty-open-next` (same app, deployed to Cloudflare
Workers via `@opennextjs/cloudflare` instead) — the two share the same
Supabase project/data and are otherwise meant to stay behaviorally
equivalent. The one deliberate divergence is `src/proxy.js` (see "Auth
gating" below): present and used here, absent there, because the two
hosting platforms differ in what they support. When porting a change
between the two repos, carry it over as-is unless it specifically concerns
that difference.

## Language

- JS/JSX for all app code — components, pages, server actions, utils, hooks.
  Do **not** create new `.ts`/`.tsx` files for app code.
- Leave `tsconfig.json` and `next-env.d.ts` as-is — required for Next.js's
  own type generation, unrelated to app code language choice.

## Folder structure

- New domain code goes feature-based: `src/features/<domain>/` containing
  that domain's components, server actions, queries, and Zod schemas (e.g.
  `src/features/users/`, `src/features/blogs/`, `src/features/properties/`).
- Existing components under `src/app/components/admin/<type>/` (type-based)
  stay as they are — migrate a piece opportunistically when you're already
  touching that domain, not as a standalone rewrite.
- Route files (`page.jsx`, `layout.jsx`) stay under
  `src/app/(admin)/admin/...` per Next.js App Router convention. The
  feature-based rule applies to component/logic organization, not routing.

## UI components

- Hand-built Tailwind components, no shadcn/ui. We tried initializing
  shadcn's CLI and it forced TypeScript output (`.tsx`/`.ts`, since
  `tsconfig.json` exists) and overwrote `globals.css` with its own default
  gray color system, a broken circular font variable, and a pile of unused
  design tokens — all had to be reverted by hand. Not worth fighting per
  component. Build primitives (buttons, inputs, selects, tables, etc.) as
  plain JSX + Tailwind utilities instead, following the pattern already
  established in `src/features/homepage/components/ui/` (e.g. `Button.jsx`)
  — native `<select>`/`<table>` elements styled directly, shared pieces
  factored into small reusable components when they repeat, not pulled
  from a component library.
- Core 5-color palette (defined as Tailwind 4 tokens in `globals.css`,
  usable as `bg-*`/`text-*`/`border-*`/etc.) — use these instead of raw hex
  values or default Tailwind palette colors:
  - `theme-blue` — `#0c2241`
  - `theme-gold` — `#b6aa84`
  - `theme-gray` — `#6b7280`
  - `white` — Tailwind's built-in white (`#ffffff`), no custom token needed
  - `black` — Tailwind's built-in black (`#000000`), no custom token needed
  - (`theme-gold-light` `#f4f2eb` and the `txt-*` tokens remain available
    as supporting tints for text/borders, but the 5 above are the palette.)
- Theme direction: modern, flat, professional, corporate.
- Every component must be built responsive (mobile, tablet, desktop) and
  dark-mode ready (Tailwind `dark:` variants) from the start — not
  retrofitted later. This applies to every component, no exceptions.
- Icons: `lucide-react` (already a dependency). Toasts/notifications:
  `sonner` directly (`import { Toaster } from "sonner"` in the root layout,
  `import { toast } from "sonner"` to fire one) — no shadcn wrapper.
- Public-site typography: Montserrat for headings/display text, Inter for
  body copy — loaded via `next/font/google` in the root layout and exposed
  as the `font-display` / `font-body` Tailwind tokens (`globals.css`). Use
  `font-display` on headings and `font-body` on the page's root element,
  never a hardcoded font name. The admin area keeps its existing Geist
  (`font-sans`) look — these are separate, intentional choices per area,
  not one to unify.

## Performance & SEO

- SEO is a first-order priority, not an afterthought. Every public-facing
  page needs proper metadata (`generateMetadata`/`metadata` export — title,
  description, canonical, Open Graph), semantic HTML, and server-rendered
  content (no content that only appears after client-side JS runs).
- Default to Server Components. Client Components (`'use client'`) are the
  exception, not the rule — reach for one only when something genuinely
  needs interactivity (form input, dropdown open state, a click handler).
- Keep Client Components as small and as deep in the tree as possible:
  push `'use client'` down to the smallest interactive leaf (e.g. a single
  "Favorite" button or a filter `<select>`), not the page or a large
  section wrapping it. Server Components should pass data down as props,
  not the other way around.
- Filtering, sorting, and pagination must be URL-driven (`searchParams`),
  not client-side state — filters read from and write to the URL so pages
  stay server-rendered, filtered views are shareable/bookmarkable, and
  back/forward navigation works correctly.
- Target full PageSpeed/Lighthouse scores (performance, accessibility,
  best practices, SEO). Concretely: use `next/image` for all images (with
  explicit width/height or fill + sized container), `next/font` for fonts,
  avoid layout shift, lazy-load below-the-fold non-critical content, and
  keep client JS bundles minimal by not over-using Client Components.
- Use `next/link` for every internal navigation link and `next/image` for
  every image, everywhere in the app — never a raw `<a href>` for internal
  routes or a raw `<img>` tag. `next/link` gives client-side navigation and
  prefetching; `next/image` gives automatic optimization, lazy-loading, and
  layout-shift prevention, all of which feed directly into the PageSpeed
  target above. Raw `<a>` is fine only for external URLs.

## Data layer

- Server Components for reads, Server Actions (`'use server'`) for
  mutations. Avoid `/app/api` routes unless something external (webhook,
  non-Next consumer) genuinely needs an HTTP endpoint.
- Keep writes server-authoritative — don't call Supabase directly for
  mutations from client components, since RBAC checks live server-side.
- Every table: soft delete (`deleted_at`, nullable) plus `created_at` /
  `updated_at`. Never hard-delete from app code.

## Auth gating — proxy.js + per-page checks, both layers matter

- `src/proxy.js` runs on every `/admin/*` and `/login` request (see its
  `matcher`): redirects an unauthenticated visitor to `/login?next=<path>`,
  and bounces an already-authenticated visitor away from `/login` back to
  `/admin`. This works here because Vercel fully supports Next.js 16's
  Node-runtime `proxy.js` — the Cloudflare sibling repo (`realty-open-next`)
  has no equivalent file because `@opennextjs/cloudflare` doesn't support it
  (see that repo's CLAUDE.md if you need the history).
- proxy.js is **not** the RBAC boundary — it only knows "signed in or not."
  Per-page/action permissions still come entirely from `requireUser()` /
  `requirePermission()` (`src/features/auth/permissions.js`), called at the
  top of every protected Server Component page/layout. Keep calling these on
  every new admin page even though proxy.js already blocks anonymous access
  — they're the layer that actually enforces role-based access.
- `src/app/login/page.jsx` does not duplicate the "already signed in" check
  itself — that's proxy.js's job here. If you ever remove proxy.js, that
  redirect needs to move back into the login page (see the Cloudflare repo's
  version for the pattern).

## Forms & validation

- React Hook Form + Zod. Reuse the same Zod schema on the client (via
  `zodResolver`) and inside the Server Action, so validation can't be
  bypassed by calling the action directly.

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`,
  `style:`, `test:`. Keep each commit scoped to its actual change.

## Testing

- No automated test suite for this phase. Revisit (Vitest for units) once
  the app's shape stabilizes.

## Don't

- Don't hard-delete records.
- Don't add a public registration page.
- Don't introduce TypeScript app files.
- Don't do client-side-only Supabase writes that skip the Server Action /
  RBAC layer.
- Don't mark a whole page/section `'use client'` to make one small piece
  interactive — isolate the interactive part instead.
- Don't hold filter/sort/pagination state in `useState` — drive it through
  the URL (`searchParams`).
- Don't use a raw `<a>` for internal links or a raw `<img>` for images —
  use `next/link` and `next/image`.
