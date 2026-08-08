import "server-only";
import fs from "node:fs";
import path from "node:path";

// Photos are static files an admin drops into public/properties/ named
// {slug}_img_1.webp, {slug}_img_2.webp, ... — there's no DB column tracking
// how many exist, so this is the one place that checks disk directly.
// Server-only: reading a bundled public/ file at request time works fine on
// Vercel (unlike writes, which aren't persisted), and is far cheaper here
// than the client-side HEAD-probing the public gallery/PDP use — this only
// ever needs a yes/no on the first image, not the full count.
export function hasPropertyImage(slug) {
	if (!slug) return false;
	try {
		return fs.existsSync(path.join(process.cwd(), "public", "properties", `${slug}_img_1.webp`));
	} catch {
		return false;
	}
}

export function propertyImagePath(slug) {
	return `/properties/${slug}_img_1.webp`;
}
