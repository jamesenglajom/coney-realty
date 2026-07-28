// Free image hosts users can paste an Avatar URL from (see Settings >
// Profile). Kept as a single source of truth: next.config.ts turns this
// into `images.remotePatterns` (so next/image will actually fetch/optimize
// it), and the avatar Zod schemas (src/features/users/schemas.js) validate
// pasted URLs against it at save time — otherwise a URL from an unlisted
// host saves fine but throws wherever it's later rendered with next/image.
export const ALLOWED_AVATAR_HOSTS = [
	"images.unsplash.com",
	"randomuser.me",
	"i.imgur.com",
	"i.ibb.co",
	"i.postimg.cc",
	// This project's Supabase Storage, in case avatars ever move to an
	// in-app upload instead of a pasted URL.
	"koashcpkbosannkefcro.supabase.co",
];
