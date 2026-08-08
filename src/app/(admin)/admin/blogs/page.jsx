import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listBlogs } from "@/features/blogs/queries";
import BlogsTable from "@/features/blogs/components/BlogsTable";
import Button from "@/components/ui/Button";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Blogs",
};

export default async function BlogsPage() {
	const user = await requirePermission("blogs", "view");
	const [blogs, permissions] = await Promise.all([listBlogs(), getPagePermissions(user.role, "blogs")]);

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
		</div>
	);
}
