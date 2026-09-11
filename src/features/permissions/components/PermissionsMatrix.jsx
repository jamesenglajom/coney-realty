"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePermissionAction } from "../actions";
import { PAGES, EDITABLE_ROLES, PERMISSION_ACTIONS, actionColumn } from "../schemas";

const ACTION_LABELS = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };

function keyOf(role, page) {
	return `${role}:${page}`;
}

export default function PermissionsMatrix({ initialPermissions }) {
	const [permissions, setPermissions] = useState(() => {
		const map = {};
		initialPermissions.forEach((row) => {
			map[keyOf(row.role, row.page)] = row;
		});
		return map;
	});
	const [, startTransition] = useTransition();

	function handleToggle(role, page, action, nextValue) {
		const key = keyOf(role, page);
		const column = actionColumn(action);
		const previous = permissions[key];

		setPermissions((current) => ({
			...current,
			[key]: { ...current[key], [column]: nextValue },
		}));

		startTransition(async () => {
			const result = await updatePermissionAction({ role, page, action, value: nextValue });
			if (result?.error) {
				toast.error(result.error);
				setPermissions((current) => ({ ...current, [key]: previous }));
			}
		});
	}

	return (
		<div className="space-y-8">
			<div className="rounded-2xl border border-theme-gold-light/70 bg-theme-gold-light/40 p-4 text-sm text-txt-secondary dark:border-border-dark dark:bg-surface-dark dark:text-txt-secondary-dark">
				SAdmin always has full access to every page — it&apos;s built into the app and can&apos;t be changed here.
				Changes below take effect immediately.
			</div>

			{EDITABLE_ROLES.map((role) => (
				<div key={role}>
					<h2 className="mb-3 text-lg font-semibold text-theme-blue dark:text-white">{role}</h2>
					<div className="overflow-hidden rounded-2xl border border-theme-gold-light/70 bg-white shadow-[0_1px_2px_rgba(20,20,20,.04),0_10px_24px_-16px_rgba(20,20,20,.10)] dark:border-border-dark dark:bg-surface-dark dark:shadow-[0_1px_2px_rgba(0,0,0,.3),0_12px_28px_-16px_rgba(0,0,0,.5)]">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[420px] text-left border-collapse">
								<thead>
									<tr className="border-b border-theme-gold-light/70 bg-bg-light dark:border-border-dark dark:bg-surface-dark-raised">
										<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
											Page
										</th>
										{PERMISSION_ACTIONS.map((action) => (
											<th
												key={action}
												className="p-4 text-center text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark"
											>
												{ACTION_LABELS[action]}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-theme-gold-light/70 dark:divide-border-dark">
									{PAGES.map((page) => {
										const row = permissions[keyOf(role, page)] ?? {};
										return (
											<tr key={page} className="hover:bg-bg-light dark:hover:bg-white/[0.02]">
												<td className="p-4 text-sm font-medium capitalize text-theme-blue dark:text-white">{page}</td>
												{PERMISSION_ACTIONS.map((action) => (
													<td key={action} className="p-4 text-center">
														<input
															type="checkbox"
															className="h-4 w-4 accent-theme-gold"
															checked={Boolean(row[actionColumn(action)])}
															onChange={(event) => handleToggle(role, page, action, event.target.checked)}
															aria-label={`${role} ${ACTION_LABELS[action]} ${page}`}
														/>
													</td>
												))}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
