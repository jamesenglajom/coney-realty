"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileMenu({ children }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="md:hidden">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-label="Toggle menu"
				aria-expanded={isOpen}
				aria-controls="mobile-menu-panel"
				className="grid h-9 w-9 place-items-center rounded-full border border-theme-gray/30 text-current dark:border-white/20"
			>
				{isOpen ? (
					<X className="h-[18px] w-[18px]" aria-hidden="true" />
				) : (
					<Menu className="h-[18px] w-[18px]" aria-hidden="true" />
				)}
			</button>
			{isOpen ? (
				<div
					id="mobile-menu-panel"
					className="absolute inset-x-0 top-16 border-t border-theme-gray/15 bg-white dark:border-white/10 dark:bg-black"
				>
					<div className="mx-auto max-w-6xl px-5 py-3 sm:px-8" onClick={() => setIsOpen(false)}>
						{children}
					</div>
				</div>
			) : null}
		</div>
	);
}
