"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
	}, []);

	function toggleTheme() {
		const next = !isDark;
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
		setIsDark(next);
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label="Toggle dark mode"
			className="grid h-9 w-9 place-items-center rounded-full border border-theme-gray/30 text-current transition-colors hover:border-theme-gray/60 dark:border-white/20 dark:hover:border-white/40"
		>
			{isDark ? (
				<Sun className="h-[18px] w-[18px]" aria-hidden="true" />
			) : (
				<Moon className="h-[18px] w-[18px]" aria-hidden="true" />
			)}
		</button>
	);
}
