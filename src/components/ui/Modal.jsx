"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
	useEffect(() => {
		if (!open) return undefined;

		function handleKeyDown(event) {
			if (event.key === "Escape") onClose();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className="relative w-full max-w-sm rounded-2xl border border-theme-gold-light bg-white p-6 shadow-2xl dark:border-[#333] dark:bg-[#1a1a1a]"
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-theme-blue dark:text-white">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="rounded-full p-1 text-txt-muted hover:bg-theme-gray/10 dark:text-txt-muted-dark dark:hover:bg-white/10"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
