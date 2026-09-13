import { requireUser } from "@/features/auth/permissions";
import { listPermissions } from "@/features/permissions/queries";
import { getUserById } from "@/features/users/queries";
import { getLastKeepAlivePing } from "@/features/system/queries";
import PermissionsMatrix from "@/features/permissions/components/PermissionsMatrix";
import KeepAlivePingCard from "@/features/system/components/KeepAlivePingCard";
import SettingsTabs from "@/features/users/components/SettingsTabs";
import ProfileForm from "@/features/users/components/ProfileForm";
import ChangePasswordForm from "@/features/users/components/ChangePasswordForm";
import ChangeEmailForm from "@/features/users/components/ChangeEmailForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Account",
};

// No requirePermission() gate here — none of these tabs are RBAC-controlled
// admin features, they're personal-account actions available to every
// signed-in role (including Agent/Manager, who have no "settings" page
// permission at all). Only the Permissions tab within stays SAdmin-only.
// (Public contact details/logo/colors moved to their own SAdmin-only
// /admin/brand page — see src/features/brand.)
export default async function SettingsPage() {
	const currentUser = await requireUser();
	const user = await getUserById(currentUser.id);
	const isSAdmin = currentUser.role === "SAdmin";
	// src/proxy.js already locks every other /admin/* route to this page
	// while this is true — SettingsTabs also hides the other tabs here so
	// there's nowhere to wander off to on this page either.
	const mustChangePassword = currentUser.mustChangePassword;
	const permissions = isSAdmin && !mustChangePassword ? await listPermissions() : [];
	const lastKeepAlivePing = isSAdmin && !mustChangePassword ? await getLastKeepAlivePing() : null;

	return (
		<div>
			<PageHeader title="Account" description="Manage your account and (for super admins) system parameters." />

			{mustChangePassword ? (
				<p className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning dark:border-warning-dark/30 dark:bg-warning-dark/10 dark:text-warning-dark">
					You&apos;re signed in with a temporary password. Set your own password below to continue.
				</p>
			) : null}

			<SettingsTabs
				forcePasswordChange={mustChangePassword}
				profileSlot={<ProfileForm user={user} />}
				changeEmailSlot={<ChangeEmailForm currentEmail={user.email} />}
				changePasswordSlot={<ChangePasswordForm />}
				permissionsSlot={isSAdmin ? <PermissionsMatrix initialPermissions={permissions} /> : null}
				systemSlot={isSAdmin ? <KeepAlivePingCard lastTriggeredAt={lastKeepAlivePing} /> : null}
			/>
		</div>
	);
}
