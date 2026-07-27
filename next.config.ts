import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "randomuser.me" },
			// Free image hosts users can paste an Avatar URL from (see Settings > Profile).
			{ protocol: "https", hostname: "i.imgur.com" },
			{ protocol: "https", hostname: "i.ibb.co" },
			{ protocol: "https", hostname: "i.postimg.cc" },
			// This project's Supabase Storage, in case avatars ever move to an
			// in-app upload instead of a pasted URL.
			{ protocol: "https", hostname: "koashcpkbosannkefcro.supabase.co" },
		],
	},
};

export default nextConfig;
