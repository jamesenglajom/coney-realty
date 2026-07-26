import { listPublishedBlogs } from "@/features/blogs/publicQueries";
import BlogPostCard from "@/features/homepage/components/BlogPostCard";
import SectionHeading from "@/features/homepage/components/ui/SectionHeading";

export const metadata = {
	title: "Insight",
	description: "Market insight, guides, and updates from the ConeyRealty team.",
};

// Without this, Next.js statically prerenders this page at build time since
// it has no dynamic APIs of its own — which both breaks the Cloudflare build
// (no Supabase credentials in the build environment) and would freeze the
// post list at whatever existed at the last deploy, never showing anything
// published afterward. Force it dynamic so it queries Supabase per request.
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
	const posts = await listPublishedBlogs();

	return (
		<section className="py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<SectionHeading eyebrow="From the desk" title="Market insight, written by people who close deals" />
				{posts.length === 0 ? (
					<p className="mt-12 text-sm text-txt-muted dark:text-txt-muted-dark">
						No articles published yet — check back soon.
					</p>
				) : (
					<div className="mt-12 grid gap-6 md:grid-cols-3">
						{posts.map((post) => (
							<BlogPostCard key={post.slug} post={post} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
