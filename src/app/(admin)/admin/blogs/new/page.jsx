import { requirePermission } from "@/features/auth/permissions";
import { listAuthors, listPropertiesForSelect } from "@/features/blogs/queries";
import BlogForm from "@/features/blogs/components/BlogForm";

export const metadata = {
	title: "New post",
};

export default async function NewBlogPage() {
	const currentUser = await requirePermission("blogs", "create");
	const [authors, properties] = await Promise.all([listAuthors(), listPropertiesForSelect()]);

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">New post</h1>
			<BlogForm mode="create" authors={authors} properties={properties} currentUserId={currentUser.id} />
		</div>
	);
}
