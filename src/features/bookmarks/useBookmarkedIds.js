"use client";

import { useEffect, useState } from "react";
import { getBookmarkedIds, BOOKMARKS_CHANGED_EVENT } from "./storage";

// Starts empty (server-rendered and the client's first paint can't read
// localStorage) and fills in on mount — same "no hydration mismatch"
// pattern as the admin header's live clock. Stays in sync across every
// mounted consumer (multiple BookmarkButtons, the header's SavedLink count)
// via the storage module's own change event, plus the native "storage"
// event for updates made in another tab.
export function useBookmarkedIds() {
	const [ids, setIds] = useState([]);

	useEffect(() => {
		setIds(getBookmarkedIds());

		function handleChange() {
			setIds(getBookmarkedIds());
		}

		window.addEventListener(BOOKMARKS_CHANGED_EVENT, handleChange);
		window.addEventListener("storage", handleChange);
		return () => {
			window.removeEventListener(BOOKMARKS_CHANGED_EVENT, handleChange);
			window.removeEventListener("storage", handleChange);
		};
	}, []);

	return ids;
}
