"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { importPropertiesAction } from "../actions";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";

const ACTION_BADGE_CLASSES = {
	created: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
	updated: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	error: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
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
						<div className="overflow-x-auto rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
							<table className="w-full min-w-[560px] text-left border-collapse text-sm">
								<thead>
									<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-[#333] dark:bg-black/40">
										<th className="p-3 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
											Row
										</th>
										<th className="p-3 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
											Slug
										</th>
										<th className="p-3 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
											Result
										</th>
										<th className="p-3 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
											Notes
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
									{result.rows.map((row) => (
										<tr key={row.rowNumber}>
											<td className="p-3 text-txt-secondary dark:text-txt-secondary-dark">{row.rowNumber}</td>
											<td className="p-3 font-mono text-xs text-txt-secondary dark:text-txt-secondary-dark">
												{row.slug || "—"}
											</td>
											<td className="p-3">
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ACTION_BADGE_CLASSES[row.action]}`}
												>
													{row.action}
												</span>
											</td>
											<td className="p-3 text-txt-secondary dark:text-txt-secondary-dark">{row.message || "—"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
