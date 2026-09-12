"use client";

import { useCallback, useEffect } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3-script";

// Loads the v3 script at most once per page, on demand — scoped to whichever
// page actually mounts a form using useRecaptcha(), instead of loading (and
// showing the "protected by reCAPTCHA" badge) site-wide from a root/public
// layout. Safe to call from multiple forms on the same page; every caller
// after the first just resolves once the one real <script> tag finishes.
function loadRecaptchaScript() {
	if (typeof window === "undefined" || !SITE_KEY) return Promise.resolve();
	if (window.grecaptcha) return Promise.resolve();

	const existing = document.getElementById(SCRIPT_ID);
	if (existing) {
		return new Promise((resolve, reject) => {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener("error", () => reject(new Error("Couldn't load reCAPTCHA.")), { once: true });
		});
	}

	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.id = SCRIPT_ID;
		script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Couldn't load reCAPTCHA."));
		document.head.appendChild(script);
	});
}

// Reusable wrapper around Google reCAPTCHA v3 for any public form — Schedule
// a Viewing today, more later. There's no visible widget to render for v3
// (no checkbox), so this is a hook rather than a JSX component: call
// getToken(action) right before submitting and send the resulting token
// along with the form's own values to the Server Action, which verifies it
// server-side (see src/features/recaptcha/verify.js) before doing anything
// else. `action` should be a short, stable, snake_case name unique to that
// form (e.g. "schedule_viewing") — reCAPTCHA uses it to build a per-action
// risk baseline, and the server checks it matches what was requested.
export function useRecaptcha() {
	// Kicks off loading as soon as the form mounts, not on first submit — by
	// the time someone actually clicks submit, the script has very likely
	// already finished loading in the background.
	useEffect(() => {
		loadRecaptchaScript().catch(() => {});
	}, []);

	const getToken = useCallback((action) => {
		if (!SITE_KEY) return Promise.resolve(null);

		return loadRecaptchaScript().then(
			() =>
				new Promise((resolve, reject) => {
					window.grecaptcha.ready(() => {
						window.grecaptcha
							.execute(SITE_KEY, { action })
							.then(resolve)
							.catch(() => reject(new Error("Couldn't verify you're human — refresh and try again.")));
					});
				}),
		);
	}, []);

	return { getToken };
}
