import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listPermissions() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("permissions")
		.select("role, page, can_view, can_create, can_edit, can_delete")
		.order("role")
		.order("page");

	if (error) throw new Error(error.message);
	return data;
}
