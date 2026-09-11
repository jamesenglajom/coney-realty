import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import DeleteUserButton from "./DeleteUserButton";
import ResetPasswordButton from "./ResetPasswordButton";
import CopyUserIdButton from "./CopyUserIdButton";

const ROLE_BADGE_CLASSES = {
	SAdmin: "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue",
	Admin: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	Manager: "bg-theme-gray/20 text-txt-secondary dark:text-txt-secondary-dark",
	Agent: "bg-theme-gray/10 text-txt-muted dark:text-txt-muted-dark",
};

function UserAvatar({ user }) {
	if (user.avatarUrl) {
		return (
			<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-surface-dark">
				<Image src={user.avatarUrl} alt="" fill sizes="40px" unoptimized className="object-cover object-top" />
			</div>
		);
	}

	return (
		<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-gold text-sm font-bold text-theme-blue ring-2 ring-white dark:ring-surface-dark">
			{(user.full_name || user.email)[0]?.toUpperCase() ?? "?"}
		</div>
	);
}

export default function UsersTable({ users, canEdit, canDelete, showUserId = false }) {
	// Preview is always available to anyone who can see this table (the page
	// itself is already gated on the "users" view permission), so the Actions
	// column shows regardless of edit/delete rights.
	const hasActionsColumn = true;

	if (users.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-theme-gold-light/80 p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
				No users yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-theme-gold-light/70 bg-white shadow-[0_1px_2px_rgba(20,20,20,.04),0_10px_24px_-16px_rgba(20,20,20,.10)] dark:border-border-dark dark:bg-surface-dark dark:shadow-[0_1px_2px_rgba(0,0,0,.3),0_12px_28px_-16px_rgba(0,0,0,.5)]">
			<div className="overflow-x-auto">
			<table className="w-full min-w-180 text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light/70 bg-bg-light dark:border-border-dark dark:bg-surface-dark-raised">
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Photo
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Name
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Role
						</th>
						{showUserId ? (
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								User ID
							</th>
						) : null}
						{hasActionsColumn ? (
							<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Actions
							</th>
						) : null}
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light/70 dark:divide-border-dark">
					{users.map((user) => (
						<tr key={user.id} className="hover:bg-bg-light dark:hover:bg-white/[0.02]">
							<td className="p-4">
								<UserAvatar user={user} />
							</td>
							<td className="p-4">
								<p className="text-sm font-semibold text-theme-blue dark:text-white">{user.full_name || "—"}</p>
								<p className="mt-0.5 truncate text-xs text-txt-secondary dark:text-txt-secondary-dark">{user.email}</p>
								{user.phone ? (
									<p className="mt-0.5 text-xs text-txt-muted dark:text-txt-muted-dark">{user.phone}</p>
								) : null}
							</td>
							<td className="p-4">
								<Badge className={ROLE_BADGE_CLASSES[user.role]}>{user.role}</Badge>
							</td>
							{showUserId ? (
								<td className="p-4">
									<div className="flex items-center gap-1.5">
										<span className="truncate font-mono text-xs text-txt-muted dark:text-txt-muted-dark">{user.id}</span>
										<CopyUserIdButton userId={user.id} />
									</div>
								</td>
							) : null}
							{hasActionsColumn ? (
								<td className="p-4 text-right">
									<div className="flex justify-end gap-2">
										<Link
											href={`/admin/users/${user.id}`}
											className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5"
										>
											<Eye className="h-3.5 w-3.5" aria-hidden="true" />
											Preview
										</Link>
										{user.role === "SAdmin" ? (
											<span className="inline-flex items-center px-2 py-1 text-xs text-txt-muted dark:text-txt-muted-dark">
												Not editable
											</span>
										) : (
											<>
												{canEdit ? (
													<Link
														href={`/admin/users/${user.id}/edit`}
														className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5"
													>
														<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
														Edit
													</Link>
												) : null}
												{canEdit ? (
													<ResetPasswordButton userId={user.id} userName={user.full_name || user.email} />
												) : null}
												{canDelete ? <DeleteUserButton userId={user.id} userName={user.full_name || user.email} /> : null}
											</>
										)}
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
