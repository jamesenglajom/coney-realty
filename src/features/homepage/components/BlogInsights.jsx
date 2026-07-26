import { listPublishedBlogs } from "@/features/blogs/publicQueries";
import SectionHeading from "./ui/SectionHeading";
import Button from "@/components/ui/Button";
import BlogPostCard from "./BlogPostCard";

export default async function BlogInsights() {
	const posts = await listPublishedBlogs(3);

	if (posts.length === 0) return null;

	return (
		<section id="insight" className="py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading eyebrow="From the desk" title="Market insight, written by people who close deals" />
					<Button href="/blog" variant="ghost" className="self-start sm:self-auto">
						All articles
					</Button>
				</div>
				<div className="mt-12 grid gap-6 md:grid-cols-3">
					{posts.map((post) => (
						<BlogPostCard key={post.slug} post={post} />
					))}
				</div>
			</div>
		</section>
	);
}
