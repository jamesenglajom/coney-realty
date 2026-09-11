import { Geist, Geist_Mono, Montserrat, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/logo/conyrealty-logo.jpg" type="image/jpeg" />
				{/* Dark-mode no-flash script, as an external file (public/no-flash-theme.js)
				    rather than inline dangerouslySetInnerHTML content — React 19 only
				    exempts src-based scripts from its "script tag rendered as a
				    component" warning; an inline one triggers it even under Next's
				    beforeInteractive strategy. beforeInteractive (root layout only)
				    still guarantees this runs before hydration/paint, so there's no
				    dark-mode flash either way. */}
				<Script src="/no-flash-theme.js" strategy="beforeInteractive" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${inter.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
