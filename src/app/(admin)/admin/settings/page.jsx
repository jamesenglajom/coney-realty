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
	title: "Settings",
};

// No requirePermission() gate here — none of these tabs are RBAC-controlled
// admin features, they're personal-account actions available to every
// signed-in role (including Agent/Manager, who have no "settings" page
// permission at all). Only the Permissions tab within stays SAdmin-only.
export default async function SettingsPage() {
	const currentUser = await requireUser();
	const user = await getUserById(currentUser.id);
	const isSAdmin = currentUser.role === "SAdmin";
	const permissions = isSAdmin ? await listPermissions() : [];
	const lastKeepAlivePing = isSAdmin ? await getLastKeepAlivePing() : null;

	return (
		<div>
			<PageHeader title="Settings" description="Manage your account and (for super admins) system parameters." />

			<SettingsTabs
				profileSlot={<ProfileForm user={user} />}
				changeEmailSlot={<ChangeEmailForm currentEmail={user.email} />}
				changePasswordSlot={<ChangePasswordForm />}
				permissionsSlot={isSAdmin ? <PermissionsMatrix initialPermissions={permissions} /> : null}
				systemSlot={isSAdmin ? <KeepAlivePingCard lastTriggeredAt={lastKeepAlivePing} /> : null}
			/>
		</div>
	);
}
