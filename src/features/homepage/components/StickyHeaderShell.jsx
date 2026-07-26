"use client";

import { useEffect, useState } from "react";

export default function StickyHeaderShell({ children }) {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setIsScrolled(window.scrollY > 12);
		}
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`sticky top-0 z-50 border-b transition-colors ${
				isScrolled
					? "border-theme-gray/15 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-black/85"
					: "border-transparent bg-transparent"
			}`}
		>
			{children}
		</header>
	);
}
