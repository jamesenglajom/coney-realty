"use client";

import { useEffect, useState, useTransition } from "react";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import Breadcrumbs from "./Breadcrumbs";

function Header({ isOpen, setOpen }) {
	const [isLoggingOut, startLogout] = useTransition();
	const [isDark, setIsDark] = useState(false);

	// Reflect the class the no-flash script in layout.jsx already applied,
	// after mount only — reading document.documentElement during render would
	// mismatch the server-rendered output.
	useEffect(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
	}, []);

	function toggleDarkMode() {
		const next = !isDark;
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
		setIsDark(next);
	}

	return (
		<header className="sticky top-0 z-30 h-16 bg-white dark:bg-surface-dark border-b border-theme-gold-light dark:border-border-dark flex items-center justify-between gap-4 px-4 lg:px-8">
			<div className="flex min-w-0 items-center gap-3">
				<button
					onClick={() => setOpen(!isOpen)}
					aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
					className="lg:hidden p-2 text-txt-primary dark:text-txt-primary-dark"
				>
					{isOpen ? <X /> : <Menu />}
				</button>
				<Breadcrumbs />
			</div>

			<div className="flex shrink-0 items-center gap-1">
				<button
					type="button"
					onClick={toggleDarkMode}
					aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
					className="rounded-full p-2 text-txt-secondary transition-colors hover:bg-theme-gold-light dark:text-txt-secondary-dark dark:hover:bg-white/10"
				>
					{isDark ? <Sun size={18} /> : <Moon size={18} />}
				</button>
				<button
					type="button"
					onClick={() => startLogout(() => logoutAction())}
					disabled={isLoggingOut}
					className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-txt-secondary transition-colors hover:bg-theme-gold-light disabled:opacity-50 dark:text-txt-secondary-dark dark:hover:bg-white/5"
				>
					<LogOut size={18} />
					<span className="hidden sm:inline">{isLoggingOut ? "Signing out…" : "Sign out"}</span>
				</button>
			</div>
		</header>
	);
}

export default Header;
