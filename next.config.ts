import type { NextConfig } from "next";
import { ALLOWED_AVATAR_HOSTS } from "./src/lib/allowed-avatar-hosts";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: ALLOWED_AVATAR_HOSTS.map((hostname) => ({
			protocol: "https" as const,
			hostname,
		})),
	},
};

export default nextConfig;
