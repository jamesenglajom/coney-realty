import { Toaster } from "sonner";
import { requireUser } from "@/features/auth/permissions";
import AdminShell from "@/app/components/admin/layout/AdminShell";

export default async function AdminLayout({ children }) {
	const user = await requireUser();

	return (
		<>
			<AdminShell user={user}>{children}</AdminShell>
			<Toaster richColors position="top-right" />
		</>
	);
}
