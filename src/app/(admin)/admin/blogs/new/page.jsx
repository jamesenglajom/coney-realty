import { requirePermission } from "@/features/auth/permissions";
import { listAuthors, listPropertiesForSelect } from "@/features/blogs/queries";
import BlogForm from "@/features/blogs/components/BlogForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "New post",
};

export default async function NewBlogPage() {
	const currentUser = await requirePermission("blogs", "create");
	const [authors, properties] = await Promise.all([listAuthors(), listPropertiesForSelect()]);

	return (
		<div>
			<PageHeader title="New post" />
			<BlogForm mode="create" authors={authors} properties={properties} currentUserId={currentUser.id} />
		</div>
	);
}
