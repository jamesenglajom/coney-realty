import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listProperties, listPropertyFilterOptions, listAssignableUsers } from "@/features/properties/queries";
import PropertiesTable from "@/features/properties/components/PropertiesTable";
import PropertiesFilterBar from "@/features/properties/components/PropertiesFilterBar";
import Button from "@/components/ui/Button";

export const metadata = {
	title: "Properties",
};

export default async function PropertiesPage({ searchParams }) {
	const params = await searchParams;
	const user = await requirePermission("properties", "view");
	const isAgent = user.role === "Agent";
	// Agents are always scoped to their own listings; the agent filter is
	// only meaningful (and only shown) for the other roles.
	const agentIdFilter = isAgent ? user.id : params.agentId || undefined;

	const [properties, permissions, filterOptions, assignableUsers] = await Promise.all([
		listProperties({
			agentId: agentIdFilter,
			city: params.city || undefined,
			district: params.district || undefined,
			propertyType: params.propertyType || undefined,
			zoneType: params.zoneType || undefined,
			priceMin: params.priceMin || undefined,
			priceMax: params.priceMax || undefined,
		}),
		getPagePermissions(user.role, "properties"),
		listPropertyFilterOptions(),
		isAgent ? Promise.resolve([]) : listAssignableUsers(),
	]);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Properties</h1>
					<p className="text-txt-secondary dark:text-txt-secondary-dark">
						{isAgent ? "Your assigned listings." : "Manage your real estate listings."}
					</p>
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
			<PropertiesFilterBar
				cities={filterOptions.cities}
				districts={filterOptions.districts}
				zoneTypes={filterOptions.zoneTypes}
				agents={assignableUsers.filter((assignableUser) => assignableUser.role === "Agent")}
				showAgentFilter={!isAgent}
			/>
			<PropertiesTable properties={properties} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
		</div>
	);
}
