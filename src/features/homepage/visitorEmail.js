// Client-only helper — remembers the visitor's email in this browser after
// they provide it once (Find Agents search gate), so they aren't re-asked on
// every subsequent search or contact click in the same browser.
const STORAGE_KEY = "coneyrealty:visitor-email";

export function getStoredVisitorEmail() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredVisitorEmail(email) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, email);
}
