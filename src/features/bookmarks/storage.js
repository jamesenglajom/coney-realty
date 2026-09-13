// Bookmarked property ids, kept client-side only — there's no guest login,
// so this is the only place a saved-properties list can live. Only the id
// is stored (never a snapshot of price/status/photos): the saved-list page
// re-fetches each one fresh, so a property that's since sold, changed
// price, or been taken down shows its *current* state instead of a stale
// copy — see features/bookmarks/queries.js.
const STORAGE_KEY = "coney-realty:bookmarks";
const CHANGE_EVENT = "coney-realty:bookmarks-changed";

function readIds() {
	if (typeof window === "undefined") return [];

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
	} catch {
		return [];
	}
}

function writeIds(ids) {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
		// Same-tab listeners (useBookmarkedIds) don't see the native "storage"
		// event — that only fires in *other* tabs — so a same-tab change needs
		// its own signal to keep every mounted BookmarkButton/SavedLink in sync.
		window.dispatchEvent(new Event(CHANGE_EVENT));
	} catch {
		// Private browsing / storage disabled — bookmarking silently no-ops
		// rather than breaking the page over a non-essential feature.
	}
}

export function getBookmarkedIds() {
	return readIds();
}

export function isBookmarked(propertyId) {
	return readIds().includes(propertyId);
}

// Returns the new saved state (true if it just got added). Newest bookmark
// goes first, so the saved-list page reads most-recently-saved-first.
export function toggleBookmark(propertyId) {
	const ids = readIds();
	const alreadySaved = ids.includes(propertyId);
	const next = alreadySaved ? ids.filter((id) => id !== propertyId) : [propertyId, ...ids];
	writeIds(next);
	return !alreadySaved;
}

export { CHANGE_EVENT as BOOKMARKS_CHANGED_EVENT };
