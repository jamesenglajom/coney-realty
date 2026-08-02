"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createFieldSetSchema, updateFieldSetSchema, FIELD_TYPES, PROPERTY_TYPES } from "../schemas";
import { createFieldSetAction, updateFieldSetAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

const EMPTY_FIELD = { key: "", label: "", type: "text", unit: "", required: false };

export default function PropertyTypeFieldSetForm({ mode, fieldSet, availableTypes }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const isEdit = mode === "edit";

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(isEdit ? updateFieldSetSchema : createFieldSetSchema),
		defaultValues: isEdit
			? { id: fieldSet.id, propertyType: fieldSet.property_type, fields: fieldSet.fields ?? [] }
			: { propertyType: availableTypes[0] ?? PROPERTY_TYPES[0], fields: [{ ...EMPTY_FIELD }] },
	});

	const { fields, append, remove } = useFieldArray({ control, name: "fields" });

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const action = isEdit ? updateFieldSetAction : createFieldSetAction;
			const result = await action(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			toast.success(isEdit ? "Field set updated." : "Field set created.");
			router.push("/admin/property-types");
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-6">
			{isEdit ? <input type="hidden" {...register("id")} /> : null}

			<div className="max-w-xs">
				<Label htmlFor="propertyType">Property type</Label>
				{isEdit ? (
					<>
						<Input id="propertyType" type="text" defaultValue={fieldSet.property_type} disabled />
						<input type="hidden" {...register("propertyType")} />
						<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
							Delete this field set and create a new one to target a different type.
						</p>
					</>
				) : (
					<Select id="propertyType" {...register("propertyType")}>
						{availableTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</Select>
				)}
				<FieldError>{errors.propertyType?.message}</FieldError>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<Label className="mb-0">Standard fields</Label>
					<Button type="button" variant="ghost" size="sm" onClick={() => append({ ...EMPTY_FIELD })}>
						<Plus className="h-3.5 w-3.5" aria-hidden="true" />
						Add field
					</Button>
				</div>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					These render as structured inputs on the property form when this type is selected. Key can be a dot-path
					(e.g. <code>lot.lot_area_sqm</code>) to target a nested location in the saved custom fields.
				</p>

				<div className="mt-4 space-y-3">
					{fields.length === 0 ? (
						<p className="rounded-xl border border-dashed border-theme-gray/30 p-6 text-center text-sm text-txt-muted dark:border-white/15 dark:text-txt-muted-dark">
							No fields yet — everything for this type will go through the property form's freeform JSON textarea.
						</p>
					) : null}

					{fields.map((field, index) => (
						<div
							key={field.id}
							className="grid gap-3 rounded-xl border border-theme-gray/20 p-4 dark:border-white/10 sm:grid-cols-[1fr_1fr_110px_90px_auto_auto] sm:items-start"
						>
							<div>
								<Label htmlFor={`fields.${index}.key`} className="sm:sr-only">
									Key
								</Label>
								<Input
									id={`fields.${index}.key`}
									type="text"
									placeholder="lot.lot_area_sqm"
									{...register(`fields.${index}.key`)}
								/>
								<FieldError>{errors.fields?.[index]?.key?.message}</FieldError>
							</div>
							<div>
								<Label htmlFor={`fields.${index}.label`} className="sm:sr-only">
									Label
								</Label>
								<Input
									id={`fields.${index}.label`}
									type="text"
									placeholder="Lot area"
									{...register(`fields.${index}.label`)}
								/>
								<FieldError>{errors.fields?.[index]?.label?.message}</FieldError>
							</div>
							<div>
								<Label htmlFor={`fields.${index}.type`} className="sm:sr-only">
									Type
								</Label>
								<Select id={`fields.${index}.type`} {...register(`fields.${index}.type`)}>
									{FIELD_TYPES.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</Select>
							</div>
							<div>
								<Label htmlFor={`fields.${index}.unit`} className="sm:sr-only">
									Unit
								</Label>
								<Input id={`fields.${index}.unit`} type="text" placeholder="sqm" {...register(`fields.${index}.unit`)} />
							</div>
							<label className="flex h-[42px] items-center gap-1.5 text-xs font-medium text-txt-secondary dark:text-txt-secondary-dark">
								<input type="checkbox" className="h-4 w-4 accent-theme-gold" {...register(`fields.${index}.required`)} />
								Required
							</label>
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
				<FieldError>{errors.fields?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : isEdit ? "Save changes" : "Create field set"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/property-types")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
