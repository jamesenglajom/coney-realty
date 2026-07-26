import { requirePermission } from "@/features/auth/permissions";
import { listPermissions } from "@/features/permissions/queries";
import PermissionsMatrix from "@/features/permissions/components/PermissionsMatrix";

export const metadata = {
	title: "Settings",
};

export default async function SettingsPage() {
	const user = await requirePermission("settings", "view");
	const isSAdmin = user.role === "SAdmin";
	const permissions = isSAdmin ? await listPermissions() : [];

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Settings</h1>
				<p className="text-txt-secondary dark:text-txt-secondary-dark">
					Configure your preferences and system parameters.
				</p>
			</div>

			{isSAdmin ? (
				<PermissionsMatrix initialPermissions={permissions} />
			) : (
				<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-[#333] dark:text-txt-muted-dark">
					Only a super admin can manage role permissions.
				</div>
			)}
		</div>
	);
}
