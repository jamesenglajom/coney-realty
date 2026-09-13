import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
	let response = NextResponse.next({ request });

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
				response = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isLoginRoute = request.nextUrl.pathname === "/login";

	if (!user && !isLoginRoute) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("next", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (user && isLoginRoute) {
		return NextResponse.redirect(new URL("/admin", request.url));
	}

	// New/reset accounts (see features/users/actions.js) carry this flag on
	// the JWT's app_metadata until the account holder sets their own password
	// via the Account > Change Password tab (features/users/actions.js's
	// changeOwnPasswordAction clears it) — locks every other admin route
	// until then, so a leaked temp password can't be used to browse the app.
	const FORCE_PASSWORD_CHANGE_PATH = "/admin/settings";
	const mustChangePassword = Boolean(user?.app_metadata?.must_change_password);
	if (mustChangePassword && request.nextUrl.pathname !== FORCE_PASSWORD_CHANGE_PATH) {
		return NextResponse.redirect(new URL(FORCE_PASSWORD_CHANGE_PATH, request.url));
	}

	return response;
}

export const config = {
	matcher: ["/admin/:path*", "/login"],
};
