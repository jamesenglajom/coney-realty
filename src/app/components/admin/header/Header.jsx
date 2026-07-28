"use client";

import { useTransition } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import Breadcrumbs from "./Breadcrumbs";

function Header({ isOpen, setOpen }) {
	const [isLoggingOut, startLogout] = useTransition();

	return (
		<header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#1a1a1a] border-b border-[#f4f2eb] dark:border-[#333] flex items-center justify-between gap-4 px-4 lg:px-8">
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

			<button
				type="button"
				onClick={() => startLogout(() => logoutAction())}
				disabled={isLoggingOut}
				className="inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-txt-secondary hover:bg-gray-100 disabled:opacity-50 dark:text-txt-secondary-dark dark:hover:bg-white/5"
			>
				<LogOut size={18} />
				<span className="hidden sm:inline">{isLoggingOut ? "Signing out…" : "Sign out"}</span>
			</button>
		</header>
	);
}

export default Header;
