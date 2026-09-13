"use server";

import { getPropertiesByIds } from "./queries";

// Public, unauthenticated — the ids themselves come from the caller's own
// localStorage, so this is just "fetch these properties," no different in
// trust level from browsing /properties. Wrapped as an action (not called
// directly from queries.js) because the saved-list page is a Client
// Component — localStorage isn't readable from a Server Component.
export async function getBookmarkedPropertiesAction(ids) {
	const properties = await getPropertiesByIds(ids);
	return { properties };
}
