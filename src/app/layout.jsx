import { Geist, Geist_Mono, Montserrat, Inter } from "next/font/google";
import Script from "next/script";
import { getBrandSettings } from "@/features/brand/queries";
import "./globals.css";

const FAVICON_MIME_BY_EXTENSION = {
	ico: "image/x-icon",
	png: "image/png",
	svg: "image/svg+xml",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

// Needed for any metadata (Open Graph images, canonical URLs) that uses a
// relative path — without this, Next can't resolve them to the absolute
// URLs social platforms/crawlers require. NEXT_PUBLIC_BASE_URL is set to
// localhost in .env.local for dev; make sure it's set to the real
// production domain in Vercel's project env vars too, or this falls back to
// the domain below.
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.startsWith("http")
	? process.env.NEXT_PUBLIC_BASE_URL
	: "https://coney-realty.vercel.app";

export const metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "ConeyRealty — Find Your Next Home in Davao",
		template: "%s | ConeyRealty",
	},
	description:
		"Browse house and lot and land listings in Davao City by location, budget, and type, then schedule a viewing online.",
};

export default async function RootLayout({ children }) {
	const brand = await getBrandSettings();
	const faviconExtension = brand.faviconUrl.split(".").pop()?.toLowerCase();
	const faviconType = FAVICON_MIME_BY_EXTENSION[faviconExtension];

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href={brand.faviconUrl} type={faviconType} />
				{/* Dark-mode no-flash script, as an external file (public/no-flash-theme.js)
				    rather than inline dangerouslySetInnerHTML content — React 19 only
				    exempts src-based scripts from its "script tag rendered as a
				    component" warning; an inline one triggers it even under Next's
				    beforeInteractive strategy. beforeInteractive (root layout only)
				    still guarantees this runs before hydration/paint, so there's no
				    dark-mode flash either way. */}
				<Script src="/no-flash-theme.js" strategy="beforeInteractive" />
				{/* SAdmin-configurable brand palette (src/features/brand) —
				    overrides the --brand-* custom properties globals.css's
				    @theme inline block indirects theme-blue/gold/gold-light/gray
				    through, so every bg-theme-blue/text-theme-gold/etc. utility
				    across the whole app repaints from this one place. Always
				    rendered (getBrandSettings() already falls back to the
				    original hardcoded hex values), so this is a no-op until a
				    SAdmin actually customizes a color. */}
				<style
					dangerouslySetInnerHTML={{
						__html: `:root{--brand-blue:${brand.colorBlue};--brand-gold:${brand.colorGold};--brand-gold-light:${brand.colorGoldLight};--brand-gray:${brand.colorGray};}`,
					}}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${inter.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
