import { Toaster } from "sonner";
import { requireUser, getRolePermissions } from "@/features/auth/permissions";
import AdminShell from "@/app/components/admin/layout/AdminShell";

export default async function AdminLayout({ children }) {
	const user = await requireUser();
	const permissions = await getRolePermissions(user.role);

	return (
		<>
			<AdminShell user={user} permissions={permissions}>
				{children}
			</AdminShell>
			<Toaster richColors position="top-right" />
		</>
	);
}
