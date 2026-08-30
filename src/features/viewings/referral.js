// Referral attribution for "Schedule a viewing" leads: an agent shares a
// link with ?agent=<their user id> to anything on the public site. Whoever
// clicks it gets that id stashed in localStorage (any page — this runs from
// the public layout, not any one route), and if they later submit the
// viewing form — on a completely different page, in the same visit — that
// stashed agent is who should be notified, regardless of who's actually
// assigned to the property they end up requesting. Client-only; the server
// re-validates the id against a real Agent user before trusting it
// (see submitViewingRequestAction).

const STORAGE_KEY = "referring-agent";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Reads ?agent=<uuid> off the current URL (if present) and stores it. Safe
// to call on every page — a page without the param leaves whatever's
// already stored untouched, so a link into one page doesn't get erased by
// browsing elsewhere on the same visit.
export function captureReferringAgentFromUrl() {
	if (typeof window === "undefined") return;

	const agentId = new URLSearchParams(window.location.search).get("agent");
	if (!agentId || !UUID_RE.test(agentId)) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ agentId, capturedAt: Date.now() }));
	} catch {
		// Private browsing / storage disabled — attribution is best-effort.
	}
}

// Returns the stashed agent id, or null if there isn't one or it's past the
// 30-day attribution window.
export function getStoredReferringAgentId() {
	if (typeof window === "undefined") return null;

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const { agentId, capturedAt } = JSON.parse(raw);
		if (!agentId || !UUID_RE.test(agentId)) return null;
		if (typeof capturedAt !== "number" || Date.now() - capturedAt > TTL_MS) return null;

		return agentId;
	} catch {
		return null;
	}
}
