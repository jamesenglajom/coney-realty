import { requirePermission } from "@/features/auth/permissions";
import { getBrandSettings } from "@/features/brand/queries";
import BrandSettingsForm from "@/features/brand/components/BrandSettingsForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Brand",
};

// requirePermission("brand", "view") is enough to make this SAdmin-only in
// practice — every other role is seeded can_view: false for the "brand"
// page, and SAdmin always reads as fully-allowed regardless of the
// permissions table (see requirePermission/getPagePermissions).
export default async function BrandPage() {
	await requirePermission("brand", "view");
	const brand = await getBrandSettings();

	return (
		<div>
			<PageHeader
				title="Brand"
				description="Site identity, colors, and contact details shown across the admin panel and public site."
			/>
			<BrandSettingsForm brand={brand} />
		</div>
	);
}
