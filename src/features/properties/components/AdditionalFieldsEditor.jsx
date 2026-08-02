"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

// Freeform key/value rows for anything not covered by this type's standard
// fields (Admin > Property Types) — an admin-friendly alternative to hand-
// writing JSON. Key can be a dot-path (e.g. "links.fbg") to nest into the
// saved custom_fields the same way the standard fields do.
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

			<div className="mt-3 space-y-2">
				{fields.length === 0 ? (
					<p className="rounded-xl border border-dashed border-theme-gray/30 p-4 text-center text-xs text-txt-muted dark:border-white/15 dark:text-txt-muted-dark">
						No additional fields.
					</p>
				) : null}

				{fields.map((field, index) => (
					<div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
						<Input
							type="text"
							placeholder="Key (e.g. links.fbg)"
							aria-label="Field key"
							{...register(`additionalFieldPairs.${index}.key`)}
						/>
						<Input
							type="text"
							placeholder="Value"
							aria-label="Field value"
							{...register(`additionalFieldPairs.${index}.value`)}
						/>
						<button
							type="button"
							onClick={() => remove(index)}
							aria-label="Remove field"
							className="flex h-[42px] items-center justify-center rounded-lg px-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
