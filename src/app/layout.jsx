import { Geist, Geist_Mono, Montserrat, Inter } from "next/font/google";
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

export const metadata = {
	title: {
		default: "ConeyRealty — Meet the agent, not the listing feed",
		template: "%s | ConeyRealty",
	},
	description:
		"Search homes by location, budget, and type and get matched with vetted local real estate agents you can call or email today.",
};

const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/logo/conyrealty-logo.jpg" type="image/jpeg" />
				<script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${inter.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
