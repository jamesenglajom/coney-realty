"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical, Eye, Pencil, BadgeCheck } from "lucide-react";
import UnmarkSoldButton from "./UnmarkSoldButton";
import DeletePropertyButton from "./DeletePropertyButton";
import MarkSoldModal from "./MarkSoldModal";

const MENU_ITEM_CLASSES =
	"flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5";
const MENU_WIDTH = 176; // matches w-44

export default function PropertyRowActions({ property, canEdit, canDelete }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// Lives outside the dropdown's own open/closed state so closing the menu
	// (to open this modal) never unmounts the modal along with it.
	const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState(null);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);

	function openMenu() {
		const rect = buttonRef.current.getBoundingClientRect();
		setMenuPosition({
			top: rect.bottom + 4,
			left: Math.max(8, rect.right - MENU_WIDTH),
		});
		setIsMenuOpen(true);
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

	useEffect(() => {
		if (!isMenuOpen) return undefined;

		function handleClickOutside(event) {
			if (
				buttonRef.current?.contains(event.target) ||
				menuRef.current?.contains(event.target)
			) {
				return;
			}
			closeMenu();
		}

		// The table's rounded-corner wrapper clips absolutely-positioned
		// descendants via overflow-hidden, which silently swallowed this menu
		// for rows anywhere near the bottom of the table (it "opened" but was
		// invisible/unreachable). Rendering it through a portal at a
		// viewport-fixed position, positioned from the trigger's own
		// bounding rect, escapes that clipping entirely. Close on scroll
		// rather than reposition — simpler and avoids a stale-position menu.
		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("scroll", closeMenu, true);
		window.addEventListener("resize", closeMenu);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("scroll", closeMenu, true);
			window.removeEventListener("resize", closeMenu);
		};
	}, [isMenuOpen]);

	return (
		<div className="inline-block text-left">
			<button
				ref={buttonRef}
				type="button"
				onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
				aria-label="Row actions"
				aria-haspopup="menu"
				aria-expanded={isMenuOpen}
				className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-txt-secondary hover:bg-theme-gold-light dark:text-txt-secondary-dark dark:hover:bg-white/5"
			>
				<MoreVertical className="h-4 w-4" aria-hidden="true" />
			</button>

			{isMenuOpen && menuPosition
				? createPortal(
						<div
							ref={menuRef}
							role="menu"
							style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
							className="z-50 overflow-hidden rounded-lg border border-theme-gold-light bg-white py-1 shadow-lg dark:border-border-dark dark:bg-surface-dark"
						>
							<Link
								href={`/admin/property/${property.slug}`}
								role="menuitem"
								className={MENU_ITEM_CLASSES}
								onClick={closeMenu}
							>
								<Eye className="h-3.5 w-3.5" aria-hidden="true" />
								Preview
							</Link>
							{canEdit ? (
								<Link
									href={`/admin/properties/${property.id}/edit`}
									role="menuitem"
									className={MENU_ITEM_CLASSES}
									onClick={closeMenu}
								>
									<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
									Edit
								</Link>
							) : null}
							{canEdit && property.status !== "sold" ? (
								<button
									type="button"
									role="menuitem"
									className={MENU_ITEM_CLASSES}
									onClick={() => {
										closeMenu();
										setIsSoldModalOpen(true);
									}}
								>
									<BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
									Mark sold
								</button>
							) : null}
							{canEdit && property.status === "sold" ? (
								<UnmarkSoldButton propertyId={property.id} propertyTitle={property.title} onDone={closeMenu} />
							) : null}
							{canDelete ? (
								<DeletePropertyButton propertyId={property.id} propertyTitle={property.title} onDone={closeMenu} />
							) : null}
						</div>,
						document.body,
					)
				: null}

			<MarkSoldModal
				open={isSoldModalOpen}
				onClose={() => setIsSoldModalOpen(false)}
				propertyId={property.id}
				propertyTitle={property.title}
			/>
		</div>
	);
}
