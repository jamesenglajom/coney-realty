"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { importPropertiesAction } from "../actions";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import Badge from "@/components/ui/Badge";

const ACTION_BADGE_TONE = {
	created: "success",
	updated: "gold",
	error: "danger",
};

export default function ImportForm() {
	const router = useRouter();
	const fileInputRef = useRef(null);
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");

	function handleSubmit(event) {
		event.preventDefault();
		const file = fileInputRef.current?.files?.[0];
		if (!file) {
			setError("Choose a file first.");
			return;
		}

		setError("");
		setResult(null);

		const formData = new FormData();
		formData.append("file", file);

		startTransition(async () => {
			const response = await importPropertiesAction(formData);
			if (response?.error) {
				setError(response.error);
				return;
			}

			setResult(response);
			toast.success(
				`Imported: ${response.createdCount} created, ${response.updatedCount} updated${
					response.errorCount ? `, ${response.errorCount} skipped` : ""
				}.`,
			);
			router.refresh();
		});
	}

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
				<input
					ref={fileInputRef}
					type="file"
					accept=".xlsx,.xls,.csv"
					className="text-sm text-txt-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-theme-gold-light file:px-4 file:py-2 file:text-sm file:font-semibold file:text-theme-blue hover:file:bg-theme-gold/30 dark:text-txt-secondary-dark"
				/>
				<Button type="submit" size="sm" disabled={isPending}>
					<Upload className="h-4 w-4" aria-hidden="true" />
					{isPending ? "Importing…" : "Import"}
				</Button>
			</form>

			<FieldError>{error}</FieldError>

			{result ? (
				<div>
					<p className="mb-3 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{result.createdCount} created, {result.updatedCount} updated
						{result.errorCount ? `, ${result.errorCount} row(s) skipped` : ""}.
					</p>
					{result.rows.length > 0 ? (
						<div className="overflow-hidden rounded-2xl border border-theme-gold-light/70 bg-white shadow-[0_1px_2px_rgba(20,20,20,.04),0_10px_24px_-16px_rgba(20,20,20,.10)] dark:border-border-dark dark:bg-surface-dark dark:shadow-[0_1px_2px_rgba(0,0,0,.3),0_12px_28px_-16px_rgba(0,0,0,.5)]">
							<div className="overflow-x-auto">
								<table className="w-full min-w-[560px] text-left border-collapse text-sm">
									<thead>
										<tr className="border-b border-theme-gold-light/70 bg-bg-light dark:border-border-dark dark:bg-surface-dark-raised">
											<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
												Row
											</th>
											<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
												Slug
											</th>
											<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
												Result
											</th>
											<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
												Notes
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-theme-gold-light/70 dark:divide-border-dark">
										{result.rows.map((row) => (
											<tr key={row.rowNumber} className="hover:bg-bg-light dark:hover:bg-white/[0.02]">
												<td className="p-4 text-txt-secondary dark:text-txt-secondary-dark">{row.rowNumber}</td>
												<td className="p-4 font-mono text-xs text-txt-secondary dark:text-txt-secondary-dark">
													{row.slug || "—"}
												</td>
												<td className="p-4">
													<Badge tone={ACTION_BADGE_TONE[row.action]} className="capitalize">
														{row.action}
													</Badge>
												</td>
												<td className="p-4 text-txt-secondary dark:text-txt-secondary-dark">{row.message || "—"}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
