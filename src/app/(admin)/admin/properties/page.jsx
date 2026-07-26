import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listProperties } from "@/features/properties/queries";
import PropertiesTable from "@/features/properties/components/PropertiesTable";
import Button from "@/components/ui/Button";

export const metadata = {
	title: "Properties",
};

export default async function PropertiesPage() {
	const user = await requirePermission("properties", "view");
	const [properties, permissions] = await Promise.all([
		listProperties(),
		getPagePermissions(user.role, "properties"),
	]);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Properties</h1>
					<p className="text-txt-secondary dark:text-txt-secondary-dark">Manage your real estate listings.</p>
				</div>
				{permissions.can_create ? (
					<div className="flex gap-2">
						<Button href="/admin/properties/import" variant="ghost" size="sm">
							Import spreadsheet
						</Button>
						<Button href="/admin/properties/new" size="sm">
							New property
						</Button>
					</div>
				) : null}
			</div>
			<PropertiesTable properties={properties} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
		</div>
	);
}
