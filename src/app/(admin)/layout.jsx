import { Toaster } from "sonner";
import { requireUser, getRolePermissions } from "@/features/auth/permissions";
import { getBrandSettings } from "@/features/brand/queries";
import AdminShell from "@/app/components/admin/layout/AdminShell";

export default async function AdminLayout({ children }) {
	const user = await requireUser();
	const [permissions, brand] = await Promise.all([getRolePermissions(user.role), getBrandSettings()]);

	return (
		<>
			<AdminShell user={user} permissions={permissions} siteName={brand.siteName} logoUrl={brand.logoUrl}>
				{children}
			</AdminShell>
			<Toaster richColors position="top-right" />
		</>
	);
}
