import Link from "next/link";
import Image from "next/image";
import { formatPostDate, getBlogCoverForSeed } from "@/features/homepage/data";
import { estimateReadMinutes } from "@/features/blogs/publicQueries";

export default function BlogPostCard({ post }) {
	const readMins = estimateReadMinutes(post.content);

	return (
		<article className="relative flex flex-col overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]">
			<div className="relative aspect-[16/10]">
				<Image
					src={post.cover_image_url || getBlogCoverForSeed(post.slug)}
					alt=""
					fill
					sizes="(min-width: 768px) 33vw, 100vw"
					className="object-cover"
				/>
			</div>
			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-center gap-2 text-xs text-txt-muted dark:text-txt-muted-dark">
					{post.author?.full_name ? <span className="font-semibold text-theme-blue dark:text-theme-gold">{post.author.full_name}</span> : null}
					<span>{readMins} min read</span>
				</div>
				<h3 className="mt-3 text-lg font-semibold leading-snug text-theme-blue dark:text-white">
					<Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
						{post.title}
					</Link>
				</h3>
				<p className="mt-2 text-sm text-txt-secondary dark:text-txt-secondary-dark">{post.excerpt}</p>
				<time dateTime={post.created_at} className="mt-auto pt-4 text-xs text-txt-muted dark:text-txt-muted-dark">
					{formatPostDate(post.created_at)}
				</time>
			</div>
		</article>
	);
}
