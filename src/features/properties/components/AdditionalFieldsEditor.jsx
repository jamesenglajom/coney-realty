"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

// Freeform key/value rows for anything not covered by this type's standard
// fields (Admin > Property Types) — an admin-friendly alternative to hand-
// writing JSON. Key can be a dot-path (e.g. "links.fbg") to nest into the
// saved custom_fields the same way the standard fields do. Row/empty-state
// treatment matches PropertyTypeFieldSetForm's field array — same "dynamic
// key/value row" concept, one shared visual language between the two.
export default function AdditionalFieldsEditor({ control, register }) {
	const { fields, append, remove } = useFieldArray({ control, name: "additionalFieldPairs" });

	return (
		<div>
			<div className="flex items-center justify-between">
				<Label className="mb-0">Additional fields</Label>
				<Button type="button" variant="ghost" size="sm" onClick={() => append({ key: "", value: "" })}>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Add field
				</Button>
			</div>
			<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
				Anything not covered by the standard fields above — a key and a value, e.g.{" "}
				<code>internal_id</code> / <code>cmikdd6lz...</code>. Use a dotted key (e.g. <code>links.fbg</code>) to
				nest it.
			</p>

			<div className="mt-3 space-y-3">
				{fields.length === 0 ? (
					<p className="rounded-xl border border-dashed border-theme-gray/30 p-6 text-center text-sm text-txt-muted dark:border-white/15 dark:text-txt-muted-dark">
						No additional fields.
					</p>
				) : null}

				{fields.map((field, index) => (
					<div
						key={field.id}
						className="grid gap-3 rounded-xl border border-theme-gray/20 p-4 dark:border-white/10 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
					>
						<div>
							<Label htmlFor={`additionalFieldPairs.${index}.key`} className="sm:sr-only">
								Key
							</Label>
							<Input
								id={`additionalFieldPairs.${index}.key`}
								type="text"
								placeholder="Key (e.g. links.fbg)"
								{...register(`additionalFieldPairs.${index}.key`)}
							/>
						</div>
						<div>
							<Label htmlFor={`additionalFieldPairs.${index}.value`} className="sm:sr-only">
								Value
							</Label>
							<Input
								id={`additionalFieldPairs.${index}.value`}
								type="text"
								placeholder="Value"
								{...register(`additionalFieldPairs.${index}.value`)}
							/>
						</div>
						<button
							type="button"
							onClick={() => remove(index)}
							aria-label="Remove field"
							className="flex h-[42px] items-center justify-center rounded-lg px-2 text-danger hover:bg-danger/10 dark:text-danger-dark dark:hover:bg-danger-dark/10"
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
