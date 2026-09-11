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
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-theme-gold-light/70 bg-white/85 px-4 backdrop-blur-md dark:border-border-dark dark:bg-surface-dark/85 lg:px-8">
			<div className="flex min-w-0 items-center gap-3">
				<button
					onClick={() => setOpen(!isOpen)}
					aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
					className="rounded-lg p-2 text-txt-primary transition-colors hover:bg-theme-gold-light dark:text-txt-primary-dark dark:hover:bg-white/5 lg:hidden"
				>
					{isOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
				<Breadcrumbs />
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				<button
					type="button"
					onClick={toggleDarkMode}
					aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
					className="rounded-full p-2.5 text-txt-secondary transition-colors hover:bg-theme-gold-light dark:text-txt-secondary-dark dark:hover:bg-white/10"
				>
					{isDark ? <Sun size={17} /> : <Moon size={17} />}
				</button>
				<div className="mx-1 h-5 w-px bg-theme-gold-light dark:bg-border-dark" aria-hidden="true" />
				<button
					type="button"
					onClick={() => startLogout(() => logoutAction())}
					disabled={isLoggingOut}
					className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold text-txt-secondary transition-colors hover:bg-theme-gold-light disabled:opacity-50 dark:text-txt-secondary-dark dark:hover:bg-white/5"
				>
					<LogOut size={16} />
					<span className="hidden sm:inline">{isLoggingOut ? "Signing out…" : "Sign out"}</span>
				</button>
			</div>
		</header>
	);
}

export default Header;
