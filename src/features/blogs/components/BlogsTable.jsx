import Link from "next/link";
import { Pencil } from "lucide-react";
import DeleteBlogButton from "./DeleteBlogButton";

const STATUS_BADGE_CLASSES = {
	draft: "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark",
	published: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

export default function BlogsTable({ blogs, canEdit, canDelete }) {
	const hasActionsColumn = canEdit || canDelete;

	if (blogs.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-[#333] dark:text-txt-muted-dark">
				No posts yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-[#333] dark:bg-black/40">
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Title
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Author
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Property
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Status
						</th>
						{hasActionsColumn ? (
							<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Actions
							</th>
						) : null}
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
					{blogs.map((blog) => (
						<tr key={blog.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
							<td className="p-4 text-sm font-semibold text-theme-blue dark:text-white">{blog.title}</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
								{blog.author?.full_name || blog.author?.email || "—"}
							</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
								{blog.property?.title || "—"}
							</td>
							<td className="p-4">
								<span
									className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE_CLASSES[blog.status]}`}
								>
									{blog.status}
								</span>
							</td>
							{hasActionsColumn ? (
								<td className="p-4 text-right">
									<div className="flex justify-end gap-2">
										{canEdit ? (
											<Link
												href={`/admin/blogs/${blog.id}/edit`}
												className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5"
											>
												<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
												Edit
											</Link>
										) : null}
										{canDelete ? <DeleteBlogButton blogId={blog.id} blogTitle={blog.title} /> : null}
									</div>
								</td>
							) : null}
						</tr>
					))}
				</tbody>
				</table>
			</div>
		</div>
	);
}
