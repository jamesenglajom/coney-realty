import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// [1, "…", 4, 5, 6, "…", 12] — always keeps first/last plus a window around
// the current page, collapsing the rest into a single ellipsis on each side.
function buildPageNumbers(current, total) {
	if (total <= 1) return [1];

	const delta = 1;
	const pages = [1];

	if (current - delta > 2) pages.push("…");
	for (let page = Math.max(2, current - delta); page <= Math.min(total - 1, current + delta); page += 1) {
		pages.push(page);
	}
	if (current + delta < total - 1) pages.push("…");

	pages.push(total);
	return pages;
}

const BASE_ITEM =
	"inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors";
const INACTIVE_ITEM = `${BASE_ITEM} text-txt-secondary hover:bg-theme-gold-light dark:text-txt-secondary-dark dark:hover:bg-white/5`;
const ACTIVE_ITEM = `${BASE_ITEM} bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue`;
const DISABLED_ITEM = `${BASE_ITEM} pointer-events-none text-txt-muted/40 dark:text-txt-muted-dark/40`;

// Server-renderable (no "use client", no JS required to navigate) — every
// control is a real <Link>, built from the page's own searchParams object
// (already awaited by the caller) so every other filter on the URL survives
// a page change. Page-number buttons are desktop-only (sm:); mobile gets a
// compact "page X of Y" readout instead, next to full-width Prev/Next
// targets, so nothing wraps or overflows at phone width.
export default function Pagination({ page, totalPages, totalCount, pageSize, basePath, searchParams = {} }) {
	if (totalPages <= 1) return null;

	function hrefFor(targetPage) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(searchParams)) {
			if (key === "page") continue;
			const resolved = Array.isArray(value) ? value[0] : value;
			if (resolved !== undefined && resolved !== null && resolved !== "") params.set(key, resolved);
		}
		if (targetPage > 1) params.set("page", String(targetPage));
		const query = params.toString();
		return query ? `${basePath}?${query}` : basePath;
	}

	const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalCount);
	const pageNumbers = buildPageNumbers(page, totalPages);
	const hasPrev = page > 1;
	const hasNext = page < totalPages;

	return (
		<nav
			aria-label="Pagination"
			className="mt-4 flex flex-col items-center gap-3 border-t border-theme-gold-light/70 pt-4 dark:border-border-dark sm:flex-row sm:justify-between"
		>
			<p className="text-xs text-txt-muted dark:text-txt-muted-dark">
				Showing <span className="font-semibold text-txt-secondary dark:text-txt-secondary-dark">{from}–{to}</span> of{" "}
				<span className="font-semibold text-txt-secondary dark:text-txt-secondary-dark">{totalCount}</span>
			</p>

			<div className="flex items-center gap-1">
				{hasPrev ? (
					<Link href={hrefFor(page - 1)} aria-label="Previous page" className={INACTIVE_ITEM}>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					</Link>
				) : (
					<span aria-hidden="true" className={DISABLED_ITEM}>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					</span>
				)}

				<div className="hidden items-center gap-1 sm:flex">
					{pageNumbers.map((entry, index) =>
						entry === "…" ? (
							<span key={`ellipsis-${index}`} className="px-1 text-xs text-txt-muted dark:text-txt-muted-dark">
								…
							</span>
						) : (
							<Link
								key={entry}
								href={hrefFor(entry)}
								aria-current={entry === page ? "page" : undefined}
								className={entry === page ? ACTIVE_ITEM : INACTIVE_ITEM}
							>
								{entry}
							</Link>
						),
					)}
				</div>

				<span className="px-1.5 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark sm:hidden">
					{page} / {totalPages}
				</span>

				{hasNext ? (
					<Link href={hrefFor(page + 1)} aria-label="Next page" className={INACTIVE_ITEM}>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				) : (
					<span aria-hidden="true" className={DISABLED_ITEM}>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</span>
				)}
			</div>
		</nav>
	);
}
