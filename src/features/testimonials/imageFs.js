import "server-only";
import fs from "node:fs";
import path from "node:path";

// A few common extensions accepted (unlike properties/agents, which are
// strictly .webp) — testimonial photos are dropped in by hand and not
// always pre-converted, so this is a little more forgiving.
const EXTENSIONS = ["webp", "jpg", "jpeg", "png"];

function findImage(key) {
	if (!key) return null;
	for (const ext of EXTENSIONS) {
		try {
			if (fs.existsSync(path.join(process.cwd(), "public", "testimonials", `${key}.${ext}`))) {
				return `/testimonials/${key}.${ext}`;
			}
		} catch {
			// try the next extension
		}
	}
	return null;
}

// Testimonial photos are static files an admin drops into
// public/testimonials/ named by the testimonial's slug (if one is set — a
// friendlier filename) or its id (always available, no extra step) — same
// static-file, no-upload-UI convention as property/agent photos (see
// src/features/properties/imageFs.js, src/features/users/imageFs.js).
export function getTestimonialPhoto({ id, slug }) {
	return findImage(slug) || findImage(id);
}
