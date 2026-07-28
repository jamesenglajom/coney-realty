// Client-only helper — remembers the visitor's email and first name in this
// browser after they provide it once (Find Agents search gate), so they
// aren't re-asked on every subsequent search or contact click in the same
// browser.
const EMAIL_STORAGE_KEY = "coneyrealty:visitor-email";
const NAME_STORAGE_KEY = "coneyrealty:visitor-first-name";

export function getStoredVisitorEmail() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

export function setStoredVisitorEmail(email) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

export function getStoredVisitorName() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(NAME_STORAGE_KEY);
}

export function setStoredVisitorName(name) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(NAME_STORAGE_KEY, name);
}
