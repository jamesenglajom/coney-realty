import Link from "next/link";
import { Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import DeleteUserButton from "./DeleteUserButton";
import ResetPasswordButton from "./ResetPasswordButton";

const ROLE_BADGE_CLASSES = {
	SAdmin: "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue",
	Admin: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	Manager: "bg-theme-gray/20 text-txt-secondary dark:text-txt-secondary-dark",
	Agent: "bg-theme-gray/10 text-txt-muted dark:text-txt-muted-dark",
};

export default function UsersTable({ users, canEdit, canDelete }) {
	const hasActionsColumn = canEdit || canDelete;

	if (users.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
				No users yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark">
			<div className="overflow-x-auto">
			<table className="w-full min-w-[560px] text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-border-dark dark:bg-black/40">
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Name
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Email
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Role
						</th>
						{hasActionsColumn ? (
							<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Actions
							</th>
						) : null}
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light dark:divide-border-dark">
					{users.map((user) => (
						<tr key={user.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
							<td className="p-4 text-sm font-semibold text-theme-blue dark:text-white">
								{user.full_name || "—"}
							</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">{user.email}</td>
							<td className="p-4">
								<Badge className={ROLE_BADGE_CLASSES[user.role]}>{user.role}</Badge>
							</td>
							{hasActionsColumn ? (
								<td className="p-4 text-right">
									{user.role === "SAdmin" ? (
										<span className="text-xs text-txt-muted dark:text-txt-muted-dark">Not editable</span>
									) : (
										<div className="flex justify-end gap-2">
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
										</div>
									)}
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
