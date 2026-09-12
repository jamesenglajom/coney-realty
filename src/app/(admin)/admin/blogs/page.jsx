import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listBlogs } from "@/features/blogs/queries";
import BlogsTable from "@/features/blogs/components/BlogsTable";
import Button from "@/components/ui/Button";
import PageHeader from "@/app/components/admin/page-header/PageHeader";
import Pagination from "@/components/ui/Pagination";

export const metadata = {
	title: "Blogs",
};

const PAGE_SIZE = 20;

export default async function BlogsPage({ searchParams }) {
	const params = await searchParams;
	const page = Math.max(1, Number(params.page) || 1);
	const user = await requirePermission("blogs", "view");
	const [{ blogs, totalCount }, permissions] = await Promise.all([
		listBlogs({ page, pageSize: PAGE_SIZE }),
		getPagePermissions(user.role, "blogs"),
	]);
	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	return (
		<div>
			<PageHeader
				title="Blogs"
				description="Draft, edit, and publish your latest articles."
				actions={
					permissions.can_create ? (
						<Button href="/admin/blogs/new" size="sm">
							New post
						</Button>
					) : null
				}
			/>
			<BlogsTable blogs={blogs} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
			<Pagination
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				basePath="/admin/blogs"
				searchParams={params}
			/>
		</div>
	);
}
