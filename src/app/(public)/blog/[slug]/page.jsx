import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getPublishedBlogBySlug, estimateReadMinutes } from "@/features/blogs/publicQueries";
import { formatPostDate, getBlogCoverForSeed } from "@/features/homepage/data";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const post = await getPublishedBlogBySlug(slug);

	if (!post) return {};

	return {
		title: post.title,
		description: post.excerpt || undefined,
	};
}

export default async function BlogPostPage({ params }) {
	const { slug } = await params;
	const post = await getPublishedBlogBySlug(slug);

	if (!post) notFound();

	const readMins = estimateReadMinutes(post.content);
	const paragraphs = String(post.content ?? "")
		.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<article className="py-20 sm:py-28">
			<div className="mx-auto max-w-2xl px-5 sm:px-8">
				<Link
					href="/blog"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					All articles
				</Link>

				<h1 className="mt-6 font-display text-[clamp(28px,4vw,42px)] font-semibold leading-tight text-theme-blue dark:text-white">
					{post.title}
				</h1>

				<div className="mt-4 flex items-center gap-2 text-sm text-txt-muted dark:text-txt-muted-dark">
					{post.author?.full_name ? (
						<>
							<span className="font-semibold text-theme-blue dark:text-theme-gold">{post.author.full_name}</span>
							<span aria-hidden="true">·</span>
						</>
					) : null}
					<time dateTime={post.created_at}>{formatPostDate(post.created_at)}</time>
					<span aria-hidden="true">·</span>
					<span>{readMins} min read</span>
				</div>

				<div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
					<Image
						src={post.cover_image_url || getBlogCoverForSeed(post.slug)}
						alt=""
						fill
						sizes="(min-width: 672px) 672px, 100vw"
						className="object-cover"
						priority
					/>
				</div>

				<div className="mt-10 space-y-5 text-base leading-relaxed text-txt-secondary dark:text-txt-secondary-dark">
					{paragraphs.length > 0 ? (
						paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
					) : (
						<p>{post.excerpt}</p>
					)}
				</div>
			</div>
		</article>
	);
}
