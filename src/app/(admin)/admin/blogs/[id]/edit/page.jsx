import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getBlogById, listAuthors, listPropertiesForSelect } from "@/features/blogs/queries";
import BlogForm from "@/features/blogs/components/BlogForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

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
			<PageHeader title="Edit post" />
			<BlogForm mode="edit" blog={blog} authors={authors} properties={properties} currentUserId={currentUser.id} />
		</div>
	);
}
