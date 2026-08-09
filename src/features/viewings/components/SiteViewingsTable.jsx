"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import { updateViewingRequestStatusAction, deleteViewingRequestAction } from "../actions";
import { STATUSES } from "../schemas";

const STATUS_TONES = {
	pending: "warning",
	confirmed: "success",
	completed: "neutral",
	cancelled: "danger",
};

const TIME_LABELS = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

function formatDate(iso) {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function formatPreferredDate(dateOnly) {
	if (!dateOnly) return null;
	return new Date(`${dateOnly}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusSelect({ requestId, status }) {
	const [current, setCurrent] = useState(status);
	const [, startTransition] = useTransition();

	function handleChange(event) {
		const next = event.target.value;
		const previous = current;
		setCurrent(next);

		startTransition(async () => {
			const result = await updateViewingRequestStatusAction(requestId, next);
			if (result?.error) {
				toast.error(result.error);
				setCurrent(previous);
			}
		});
	}

	return (
		<div className="inline-flex items-center gap-2">
			<Badge tone={STATUS_TONES[current]} className="capitalize">
				{current}
			</Badge>
			<Select value={current} onChange={handleChange} className="w-auto px-2 py-1 text-xs">
				{STATUSES.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</Select>
		</div>
	);
}

function DeleteButton({ requestId, visitorName }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (!window.confirm(`Remove the viewing request from ${visitorName}? This can't be undone from the UI.`)) return;

		startTransition(async () => {
			const result = await deleteViewingRequestAction(requestId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Viewing request removed.");
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isPending}
			aria-label={`Remove viewing request from ${visitorName}`}
			className="inline-flex items-center justify-center rounded-lg p-1.5 text-danger hover:bg-danger/10 disabled:opacity-50 dark:text-danger-dark dark:hover:bg-danger-dark/10"
		>
			<Trash2 className="h-4 w-4" aria-hidden="true" />
		</button>
	);
}

export default function SiteViewingsTable({ requests, canDelete = false }) {
	if (requests.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
				No viewing requests yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[860px] text-left border-collapse">
					<thead>
						<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-border-dark dark:bg-black/40">
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Visitor
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Properties
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Preferred
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Message
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Submitted
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Status
							</th>
							{canDelete ? (
								<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
									<span className="sr-only">Actions</span>
								</th>
							) : null}
						</tr>
					</thead>
					<tbody className="divide-y divide-theme-gold-light dark:divide-border-dark">
						{requests.map((request) => {
							const preferredParts = [formatPreferredDate(request.preferred_date), TIME_LABELS[request.preferred_time]].filter(
								Boolean,
							);

							return (
								<tr key={request.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
									<td className="p-4">
										<p className="text-sm font-semibold text-theme-blue dark:text-white">{request.visitor_name}</p>
										<p className="text-xs text-txt-secondary dark:text-txt-secondary-dark">{request.visitor_email}</p>
										{request.visitor_phone ? (
											<p className="text-xs text-txt-muted dark:text-txt-muted-dark">{request.visitor_phone}</p>
										) : null}
									</td>
									<td className="p-4">
										<div className="flex flex-wrap gap-1.5">
											{request.properties.length === 0 ? (
												<span className="text-sm text-txt-muted dark:text-txt-muted-dark">—</span>
											) : (
												request.properties.map((property) => (
													<Link
														key={property.id}
														href={`/property/${property.slug}`}
														target="_blank"
														className="rounded-full bg-theme-gold/20 px-2.5 py-0.5 text-xs font-medium text-theme-blue hover:underline dark:text-theme-gold"
													>
														{property.name}
													</Link>
												))
											)}
										</div>
									</td>
									<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
										{preferredParts.length > 0 ? preferredParts.join(" · ") : "—"}
									</td>
									<td className="max-w-[220px] p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
										<p className="truncate" title={request.message ?? ""}>
											{request.message || "—"}
										</p>
									</td>
									<td className="p-4 text-sm text-txt-muted dark:text-txt-muted-dark">{formatDate(request.created_at)}</td>
									<td className="p-4">
										<StatusSelect requestId={request.id} status={request.status} />
									</td>
									{canDelete ? (
										<td className="p-4">
											<DeleteButton requestId={request.id} visitorName={request.visitor_name} />
										</td>
									) : null}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
