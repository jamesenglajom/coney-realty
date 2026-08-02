"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "./schemas";

export async function loginAction({ email, password, next }) {
	const parsed = loginSchema.safeParse({ email, password });

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword(parsed.data);

	if (error) {
		return { error: "Incorrect email or password." };
	}

	const safeNext = typeof next === "string" && next.startsWith("/admin") ? next : "/admin";
	redirect(safeNext);
}

export async function logoutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/login");
}
