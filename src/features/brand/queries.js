import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

// The "factory" values — identical to what was hardcoded across the app
// (globals.css, the logo/favicon <link>, HeroSearch's HERO_IMAGE, the old
// site_settings fallbacks) before brand settings existed, so a missing row
// or an unset field renders exactly as it did before this feature shipped.
export const BRAND_DEFAULTS = {
	siteName: "ConeyRealty",
	logoUrl: "/logo/conyrealty-logo.jpg",
	faviconUrl: "/logo/conyrealty-logo.jpg",
	bannerUrl: "/images/hero-team.webp",
	colorBlue: "#0c2241",
	colorGold: "#b6aa84",
	colorGoldLight: "#f4f2eb",
	colorGray: "#6b7280",
	address: "",
	contactNumber: "",
	contactEmail: "",
};

// Read everywhere brand identity shows up — the root layout (favicon, color
// overrides), the admin sidebar, the login page, and the public header/
// footer/hero. cache()'d so however many of those render in one request,
// this only hits the database once.
export const getBrandSettings = cache(async function getBrandSettings() {
	const supabase = createAdminClient();
	const { data } = await supabase
		.from("brand_settings")
		.select(
			"site_name, logo_url, favicon_url, banner_url, color_blue, color_gold, color_gold_light, color_gray, address, contact_number, contact_email",
		)
		.eq("id", true)
		.maybeSingle();

	return {
		siteName: data?.site_name || BRAND_DEFAULTS.siteName,
		logoUrl: data?.logo_url || BRAND_DEFAULTS.logoUrl,
		faviconUrl: data?.favicon_url || BRAND_DEFAULTS.faviconUrl,
		bannerUrl: data?.banner_url || BRAND_DEFAULTS.bannerUrl,
		colorBlue: data?.color_blue || BRAND_DEFAULTS.colorBlue,
		colorGold: data?.color_gold || BRAND_DEFAULTS.colorGold,
		colorGoldLight: data?.color_gold_light || BRAND_DEFAULTS.colorGoldLight,
		colorGray: data?.color_gray || BRAND_DEFAULTS.colorGray,
		address: data?.address ?? "",
		contactNumber: data?.contact_number ?? "",
		contactEmail: data?.contact_email ?? "",
	};
});
