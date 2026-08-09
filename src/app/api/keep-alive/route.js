import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase's free tier auto-pauses a project after 7 days with no API
// activity. This route exists purely so a Vercel Cron Job (see
// vercel.json — runs once daily, well under that threshold) can hit it and
// keep the project's activity clock from ever reaching 7 days. Genuinely
// needs an HTTP endpoint since the caller is an external scheduler, not
// something inside this Next app.
export async function GET(request) {
	// Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on
	// cron-triggered requests when that env var is set. Optional: works
	// without it (so this deploys and runs immediately), but set
	// CRON_SECRET in the Vercel project's env vars to stop this endpoint
	// from being triggerable by anyone who finds the URL.
	if (process.env.CRON_SECRET) {
		const authHeader = request.headers.get("authorization");
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("properties").select("id").limit(1);

	if (error) {
		return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
