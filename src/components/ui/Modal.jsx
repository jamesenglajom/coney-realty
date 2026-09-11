"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const SIZE_CLASSES = {
	sm: "max-w-sm",
	lg: "max-w-2xl",
	xl: "max-w-4xl",
};

export default function Modal({ open, onClose, title, children, size = "sm" }) {
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
			<div className="absolute inset-0 bg-theme-blue-deep/50 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
			{/* max-h + flex column, with only the middle section scrolling — on a
			    short viewport (phone landscape, tablet) a tall form used to spill
			    past the bottom of the screen with no way to scroll down to its own
			    Save button. Header/footer (title bar here; each form's own submit
			    row lives in `children`, so it scrolls with the body — see below)
			    stay reachable either way. */}
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className={`relative flex max-h-[85vh] w-full ${SIZE_CLASSES[size]} flex-col rounded-2xl border border-theme-gold-light/70 bg-white shadow-[0_24px_60px_-20px_rgba(6,21,39,.45)] dark:border-border-dark dark:bg-surface-dark`}
			>
				<div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
					<h2 className="text-lg font-semibold text-theme-blue dark:text-white">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="rounded-full p-1.5 text-txt-muted transition-colors hover:bg-theme-gold-light hover:text-theme-blue dark:text-txt-muted-dark dark:hover:bg-white/10 dark:hover:text-white"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
				<div className="overflow-y-auto px-6 pb-6">{children}</div>
			</div>
		</div>
	);
}
