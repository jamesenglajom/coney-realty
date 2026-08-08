-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: uses if-not-exists / on-conflict guards throughout.
--
-- Bootstrapping the first SAdmin (there's no self-registration, so this one
-- account has to be created by hand):
--   1. Supabase Dashboard > Authentication > Users > Add user. Set an email
--      and password directly (skip "send invite" unless email is configured).
--   2. Copy the new user's UUID, then run:
--       insert into public.users (id, email, full_name, role)
--       values ('<uuid-from-step-1>', '<email-from-step-1>', 'Super Admin', 'SAdmin');
--   Every user after this one can be created from the app's admin panel.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('SAdmin', 'Admin', 'Manager', 'Agent');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users — one row per auth.users account. Role lives here, not in Supabase
-- Auth metadata, so it can be joined/filtered/audited with plain SQL.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role user_role not null default 'Agent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists users_role_idx on public.users (role);
create unique index if not exists users_email_idx on public.users (email) where deleted_at is null;

alter table public.users enable row level security;
-- Deny-by-default: no policies means anon/authenticated get zero access except
-- the one below. Listing/creating/editing/deleting *other* users all go through
-- Server Actions using the service role key (bypasses RLS), gated by the
-- app-level permission check — the trust boundary is the Server Action, not
-- Postgres RLS. This policy only covers a signed-in user reading their own row
-- (needed for the sidebar profile display and the permission check itself).
drop policy if exists "users can read own row" on public.users;
create policy "users can read own row" on public.users
  for select
  to authenticated
  using (auth.uid() = id and deleted_at is null);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_info — 1:1 profile detail, split from `users` so the auth/admin table
-- stays lean and this can hold public-facing fields (phone, bio, avatar) that
-- vary a lot by role (an Agent needs a public bio; a Manager may not).
-- ---------------------------------------------------------------------------
create table if not exists public.user_info (
  user_id uuid primary key references public.users (id) on delete cascade,
  phone text,
  avatar_url text,
  bio text,
  address_line text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_info enable row level security;
drop policy if exists "users can read own info" on public.user_info;
create policy "users can read own info" on public.user_info
  for select
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists set_user_info_updated_at on public.user_info;
create trigger set_user_info_updated_at
  before update on public.user_info
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- permissions — role x page capability matrix, editable by SAdmin from a
-- Settings screen so RBAC changes don't require a deploy.
-- ---------------------------------------------------------------------------
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  page text not null,
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role, page)
);

alter table public.permissions enable row level security;
-- Any signed-in user can read the permission matrix (needed to check their own
-- role's access — the data itself isn't sensitive, it's just capability flags).
-- Writes are not exposed here: they go through a Server Action gated to SAdmin.
drop policy if exists "authenticated can read permissions" on public.permissions;
create policy "authenticated can read permissions" on public.permissions
  for select
  to authenticated
  using (true);

-- Seed sensible defaults. SAdmin also gets a hardcoded bypass in application code
-- so a misconfigured or emptied permissions table can never lock SAdmin out.
insert into public.permissions (role, page, can_view, can_create, can_edit, can_delete)
values
  ('SAdmin', 'dashboard', true, true, true, true),
  ('SAdmin', 'users', true, true, true, true),
  ('SAdmin', 'blogs', true, true, true, true),
  ('SAdmin', 'properties', true, true, true, true),
  ('SAdmin', 'settings', true, true, true, true),
  ('SAdmin', 'leads', true, true, true, true),
  ('SAdmin', 'propertyTypes', true, true, true, true),
  ('Admin', 'dashboard', true, true, true, true),
  ('Admin', 'users', true, true, true, false),
  ('Admin', 'blogs', true, true, true, true),
  ('Admin', 'properties', true, true, true, true),
  ('Admin', 'settings', true, false, false, false),
  ('Admin', 'leads', true, false, false, false),
  ('Admin', 'propertyTypes', true, true, true, true),
  ('Manager', 'dashboard', true, false, false, false),
  ('Manager', 'users', false, false, false, false),
  ('Manager', 'blogs', true, true, true, false),
  ('Manager', 'properties', true, true, true, false),
  ('Manager', 'settings', false, false, false, false),
  ('Manager', 'leads', false, false, false, false),
  ('Manager', 'propertyTypes', true, true, true, false),
  ('Agent', 'dashboard', true, false, false, false),
  ('Agent', 'users', false, false, false, false),
  ('Agent', 'blogs', false, false, false, false),
  ('Agent', 'properties', true, false, false, false),
  ('Agent', 'settings', false, false, false, false),
  ('Agent', 'leads', false, false, false, false),
  ('Agent', 'propertyTypes', false, false, false, false)
on conflict (role, page) do nothing;

drop trigger if exists set_permissions_updated_at on public.permissions;
create trigger set_permissions_updated_at
  before update on public.permissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- properties — the listings themselves. custom_fields holds attributes that
-- vary by property_type (beds/baths for a House, acreage for Land, etc.)
-- rather than a column per possible attribute.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type property_type as enum ('House', 'Apartment', 'Villa', 'Condo', 'Land', 'House and Lot');
  end if;
  if not exists (select 1 from pg_type where typname = 'property_status') then
    create type property_status as enum ('draft', 'published', 'sold', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'property_payment_type') then
    create type property_payment_type as enum ('buy', 'rent', 'rent-to-own');
  end if;
end $$;

-- Enum already exists in the deployed DB, so the value list above only
-- applies on a fresh `create type`. This covers the already-existing type
-- when this file is re-run against it. Postgres requires ADD VALUE to run
-- outside any transaction that also uses the new value, so this must be a
-- separate statement (not inside a do $$ block) and separately committed
-- before anything inserts 'House and Lot'.
alter type property_type add value if not exists 'House and Lot';

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- Public-facing display name, shown on the marketing site in place of
  -- `title` when set (falls back to `title` when null) — lets the internal
  -- listing title differ from what's posted publicly.
  screen_name text,
  slug text not null,
  property_type property_type not null,
  status property_status not null default 'draft',
  price numeric(14, 2),
  -- Full street address is intentionally separate from the public display
  -- label — the homepage never shows an exact address, only city/state.
  address_line text,
  city_state text,
  -- Structured location fields, kept alongside the freeform city_state
  -- display label above rather than replacing it.
  city text,
  region text,
  district text,
  zone_type text,
  payment_type property_payment_type,
  payment_terms text,
  lat double precision,
  lng double precision,
  custom_fields jsonb not null default '{}'::jsonb,
  -- Rich-text (TipTap-authored HTML) description shown on the public
  -- property detail page — admin-authored only (never public input), so
  -- rendering it as raw HTML there is safe.
  html_body text,
  -- Set (and cleared) by the app whenever status transitions into/out of
  -- 'sold' — see updatePropertyAction — so agent dashboards can compute
  -- "this month's sales" without guessing off updated_at.
  sold_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Table already exists in the deployed DB, so the columns above only apply
-- on a fresh `create table`. These `add column if not exists` cover the
-- already-existing table when this file is re-run against it.
alter table public.properties add column if not exists screen_name text;
alter table public.properties add column if not exists html_body text;
alter table public.properties add column if not exists city text;
alter table public.properties add column if not exists region text;
alter table public.properties add column if not exists district text;
alter table public.properties add column if not exists zone_type text;
alter table public.properties add column if not exists payment_type property_payment_type;
alter table public.properties add column if not exists payment_terms text;
alter table public.properties add column if not exists sold_at timestamptz;

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_type_idx on public.properties (property_type);
create index if not exists properties_payment_type_idx on public.properties (payment_type);
create unique index if not exists properties_slug_idx on public.properties (slug) where deleted_at is null;

alter table public.properties enable row level security;
-- Admin CRUD goes through Server Actions with the service role key (deny-by-
-- default covers that). This policy is the public-facing read: anyone,
-- including signed-out visitors, can read published/non-deleted listings —
-- that's the whole point of the draft/published split.
drop policy if exists "public can read published properties" on public.properties;
create policy "public can read published properties" on public.properties
  for select
  to anon, authenticated
  using (status = 'published' and deleted_at is null);

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- property_type_field_sets — per-property-type standard custom field
-- definitions (Admin > Property Types), so the property form can render
-- structured inputs (e.g. "Lot area (sqm)") for the attributes every
-- listing of that type is expected to have, instead of always falling back
-- to a raw JSON textarea. Fields not covered by a type's set stay editable
-- via the property form's freeform "Additional fields (JSON)" textarea —
-- this never replaces that escape hatch, just narrows what needs it. `key`
-- values may be dot-paths (e.g. "lot.lot_area_sqm") to match how
-- custom_fields is already nested for existing data.
-- ---------------------------------------------------------------------------
create table if not exists public.property_type_field_sets (
  id uuid primary key default gen_random_uuid(),
  property_type property_type not null,
  fields jsonb not null default '[]'::jsonb,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists property_type_field_sets_type_idx
  on public.property_type_field_sets (property_type) where deleted_at is null;

alter table public.property_type_field_sets enable row level security;
-- Deny-by-default, no policies: admin-only CRUD goes through Server Actions
-- (service role). The public site never reads this table — it only shapes
-- the admin property form, not how already-saved data is displayed.

drop trigger if exists set_property_type_field_sets_updated_at on public.property_type_field_sets;
create trigger set_property_type_field_sets_updated_at
  before update on public.property_type_field_sets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_property — which agent(s) are assigned to which property. Many-to-
-- many: a property can have more than one agent, an agent can have many
-- properties.
-- ---------------------------------------------------------------------------
create table if not exists public.user_property (
  user_id uuid not null references public.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists user_property_property_idx on public.user_property (property_id);

alter table public.user_property enable row level security;
-- Deny-by-default, no policies: assignments are managed through Server
-- Actions (service role) alongside property/user CRUD, never queried directly
-- by the client.

-- ---------------------------------------------------------------------------
-- blogs — content marketing posts, optionally tied to a specific listing.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'blog_status') then
    create type blog_status as enum ('draft', 'published');
  end if;
end $$;

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  author_id uuid references public.users (id) on delete set null,
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  cover_image_url text,
  status blog_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Table already exists in the deployed DB — see the properties table's
-- identical note above for why this is needed alongside the column def.
alter table public.blogs add column if not exists cover_image_url text;

create index if not exists blogs_status_idx on public.blogs (status);
create unique index if not exists blogs_slug_idx on public.blogs (slug) where deleted_at is null;

alter table public.blogs enable row level security;
drop policy if exists "public can read published blogs" on public.blogs;
create policy "public can read published blogs" on public.blogs
  for select
  to anon, authenticated
  using (status = 'published' and deleted_at is null);

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- agent_contact_requests — leads from the public "Find agents" search: the
-- visitor's email (captured once, before results are shown) plus which
-- agent they actually reached out to and how. Insert-only from a public
-- Server Action (no session), so RLS stays deny-by-default and the action
-- itself is the trust boundary — same convention as user_property writes.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_method') then
    create type contact_method as enum ('email', 'call');
  end if;
end $$;

create table if not exists public.agent_contact_requests (
  id uuid primary key default gen_random_uuid(),
  visitor_email text not null,
  visitor_name text,
  agent_id uuid references public.users (id) on delete set null,
  contact_method contact_method not null default 'email',
  search_location text,
  search_property_type text,
  search_price_band text,
  created_at timestamptz not null default now()
);

-- Table already exists in the deployed DB — see the properties table's
-- identical note above for why this is needed alongside the column def.
alter table public.agent_contact_requests add column if not exists visitor_name text;

create index if not exists agent_contact_requests_agent_idx on public.agent_contact_requests (agent_id);

alter table public.agent_contact_requests enable row level security;
-- No policies: deny-by-default. Both the insert (public Server Action) and
-- any future admin read go through the service-role client.
