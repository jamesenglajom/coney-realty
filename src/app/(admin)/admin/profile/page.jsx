import { redirect } from "next/navigation";

// Profile editing moved into the Account tabs (Profile / Change email /
// Change password) — redirect any old links/bookmarks there.
export default function ProfilePage() {
	redirect("/admin/settings");
}
