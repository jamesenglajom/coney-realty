import Link from "next/link";
import { Pencil } from "lucide-react";
import DeleteFieldSetButton from "./DeleteFieldSetButton";

export default function PropertyTypeFieldSetsTable({ fieldSets, canEdit, canDelete }) {
	if (fieldSets.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-[#333] dark:text-txt-muted-dark">
				No property types configured yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[560px] text-left border-collapse">
					<thead>
						<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-[#333] dark:bg-black/40">
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Property type
							</th>
							<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Standard fields
							</th>
							<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
						{fieldSets.map((fieldSet) => (
							<tr key={fieldSet.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
								<td className="p-4 text-sm font-semibold text-theme-blue dark:text-white">{fieldSet.property_type}</td>
								<td className="p-4">
									{fieldSet.fields.length === 0 ? (
										<span className="text-sm text-txt-muted dark:text-txt-muted-dark">—</span>
									) : (
										<div className="flex flex-wrap gap-1.5">
											{fieldSet.fields.map((field) => (
												<span
													key={field.key}
													className="inline-flex items-center rounded-full bg-theme-gold-light px-2.5 py-0.5 text-xs font-medium text-theme-blue dark:bg-white/10 dark:text-theme-gold"
												>
													{field.label}
												</span>
											))}
										</div>
									)}
								</td>
								<td className="p-4 text-right">
									<div className="flex justify-end gap-2">
										{canEdit ? (
											<Link
												href={`/admin/property-types/${fieldSet.id}/edit`}
												className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5"
											>
												<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
												Edit
											</Link>
										) : null}
										{canDelete ? (
											<DeleteFieldSetButton fieldSetId={fieldSet.id} propertyType={fieldSet.property_type} />
										) : null}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
