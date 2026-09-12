import "server-only";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_MIN_SCORE = 0.5;

// Server-side half of the reCAPTCHA v3 wrapper — call from any Server
// Action handling a public form's submission, right before (or alongside)
// its own zod validation. `token` is whatever useRecaptcha().getToken(action)
// resolved with on the client; `action` should match the same string passed
// there, so a token minted for one form can't be replayed against another.
//
// Fails OPEN (treats the submission as verified) when RECAPTCHA_SECRET_KEY
// isn't configured at all, so local dev/preview environments without the
// key set still work. Once a secret key *is* configured, a missing or
// failing token fails CLOSED — a form can't be bypassed just by skipping
// the client-side getToken() call.
export async function verifyRecaptcha(token, { action, minScore = DEFAULT_MIN_SCORE } = {}) {
	const secretKey = process.env.RECAPTCHA_SECRET_KEY;
	if (!secretKey) return { success: true };
	if (!token) return { success: false, error: "Missing verification token." };

	let payload;
	try {
		const response = await fetch(VERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret: secretKey, response: token }),
		});
		payload = await response.json();
	} catch {
		return { success: false, error: "Couldn't reach the verification service." };
	}

	if (!payload.success) return { success: false, error: "Verification failed." };
	if (action && payload.action !== action) return { success: false, error: "Verification failed." };
	if (typeof payload.score === "number" && payload.score < minScore) {
		return { success: false, error: "Verification failed.", score: payload.score };
	}

	return { success: true, score: payload.score };
}
