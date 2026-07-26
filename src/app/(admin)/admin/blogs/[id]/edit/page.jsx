import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getBlogById, listAuthors, listPropertiesForSelect } from "@/features/blogs/queries";
import BlogForm from "@/features/blogs/components/BlogForm";

export const metadata = {
	title: "Edit post",
};

export default async function EditBlogPage({ params }) {
	const { id } = await params;
	const currentUser = await requirePermission("blogs", "edit");

	const [blog, authors, properties] = await Promise.all([
		getBlogById(id),
		listAuthors(),
		listPropertiesForSelect(),
	]);

	if (!blog) notFound();

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">Edit post</h1>
			<BlogForm mode="edit" blog={blog} authors={authors} properties={properties} currentUserId={currentUser.id} />
		</div>
	);
}
