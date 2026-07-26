import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listBlogs } from "@/features/blogs/queries";
import BlogsTable from "@/features/blogs/components/BlogsTable";
import Button from "@/components/ui/Button";

export const metadata = {
	title: "Blogs",
};

export default async function BlogsPage() {
	const user = await requirePermission("blogs", "view");
	const [blogs, permissions] = await Promise.all([listBlogs(), getPagePermissions(user.role, "blogs")]);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Blogs</h1>
					<p className="text-txt-secondary dark:text-txt-secondary-dark">Draft, edit, and publish your latest articles.</p>
				</div>
				{permissions.can_create ? (
					<Button href="/admin/blogs/new" size="sm">
						New post
					</Button>
				) : null}
			</div>
			<BlogsTable blogs={blogs} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
		</div>
	);
}
