# Property images

Property photos are plain static files in this folder — there's no upload
UI and no database column tracking them. The app discovers a property's
photos purely by trying to load files that follow the naming pattern
below, so getting the filename right is what makes an image show up.

## Naming pattern

```
{slug}_img_1.webp
{slug}_img_2.webp
{slug}_img_3.webp
...
```

- **Format must be `.webp`.** Other extensions aren't recognized.
- **`{slug}`** is the property's `slug` field — the same value in its
  public URL (`/property/{slug}`) and on its Slug field in the admin
  Properties form.
- **Numbering starts at `1` and must be sequential with no gaps.** The
  gallery probes `_img_1`, `_img_2`, `_img_3`, ... and stops at the first
  missing number — so `_img_1` + `_img_3` with no `_img_2` will cut off
  everything from `_img_2` onward, `_img_3` included.
- **`_img_1.webp`** is also what's used as the single cover photo
  everywhere a property is shown as a card (homepage Featured Homes, an
  agent's public profile listings, the `/properties` gallery grid).
- Up to **20 images** per property are probed (`MAX_IMAGES` in
  `PropertyPhotoGallery.jsx`).

### Example

For a property with slug `villa-de-mercedes-davao-city`:

```
public/properties/villa-de-mercedes-davao-city_img_1.webp
public/properties/villa-de-mercedes-davao-city_img_2.webp
public/properties/villa-de-mercedes-davao-city_img_3.webp
```

## Finding a property's slug

- Admin → Properties → open the property → the **Slug** field on the edit
  form.
- Or read it off the property's public URL:
  `coneyrealty.com/property/<slug>`.

## No photos yet?

A property with no matching files falls back to a deterministic
placeholder image (`getPropertyImageForSeed` in
`src/features/homepage/data.js`) instead of showing broken art — the same
placeholder every time for a given property, not a random one per page
load.

## Sizing (not enforced, but recommended)

Images render with `object-cover`, so exact dimensions don't matter, but
for sharp results without over-uploading:

- Roughly **1600×1000px** or similar landscape ratio works well for both
  the card thumbnail (4:3) and the detail-page gallery (16:10).
- Keep individual files to a few hundred KB — these are served as-is from
  `public/`, with no server-side optimization pass.

## Going live

`public/` is bundled at build time and isn't writable at runtime, so after
adding files here you need to **commit and push** (or deploy) for them to
show up on the live site. There's no way to add images through the admin
panel today.

## Where this is implemented

- `src/features/properties/components/PropertyCoverImage.jsx` — single
  cover photo (`_img_1`) used on cards, with the placeholder fallback.
- `src/features/properties/components/PropertyPhotoGallery.jsx` — full
  probed gallery used on the public property detail page
  (`/property/[slug]`).
