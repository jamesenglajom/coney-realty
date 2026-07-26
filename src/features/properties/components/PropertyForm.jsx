"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPropertySchema, updatePropertySchema, PROPERTY_TYPES, PROPERTY_STATUSES } from "../schemas";
import { createPropertyAction, updatePropertyAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

function slugify(value) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

export default function PropertyForm({ mode, property, assignableUsers }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const isEdit = mode === "edit";

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(isEdit ? updatePropertySchema : createPropertySchema),
		defaultValues: isEdit
			? {
					id: property.id,
					title: property.title,
					slug: property.slug,
					propertyType: property.property_type,
					status: property.status,
					price: property.price != null ? String(property.price) : "",
					addressLine: property.address_line ?? "",
					cityState: property.city_state ?? "",
					lat: property.lat != null ? String(property.lat) : "",
					lng: property.lng != null ? String(property.lng) : "",
					customFields: JSON.stringify(property.custom_fields ?? {}, null, 2),
					assignedUserIds: property.assignedUserIds ?? [],
				}
			: {
					title: "",
					slug: "",
					propertyType: PROPERTY_TYPES[0],
					status: PROPERTY_STATUSES[0],
					price: "",
					addressLine: "",
					cityState: "",
					lat: "",
					lng: "",
					customFields: "{}",
					assignedUserIds: [],
				},
	});

	// Auto-derive the slug from the title as the user types, until they
	// manually edit the slug field themselves — then it's theirs to control.
	const slugTouchedRef = useRef(isEdit);
	const titleValue = watch("title");

	useEffect(() => {
		if (slugTouchedRef.current) return;
		setValue("slug", slugify(titleValue || ""), { shouldValidate: false });
	}, [titleValue, setValue]);

	const { onChange: onSlugChange, ...slugField } = register("slug");

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const action = isEdit ? updatePropertyAction : createPropertyAction;
			const result = await action(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			toast.success(isEdit ? "Property updated." : "Property created.");
			router.push("/admin/properties");
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-4">
			{isEdit ? <input type="hidden" {...register("id")} /> : null}

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="title">Title</Label>
					<Input id="title" type="text" {...register("title")} />
					<FieldError>{errors.title?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						type="text"
						{...slugField}
						onChange={(event) => {
							slugTouchedRef.current = true;
							onSlugChange(event);
						}}
					/>
					<FieldError>{errors.slug?.message}</FieldError>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="propertyType">Property type</Label>
					<Select id="propertyType" {...register("propertyType")}>
						{PROPERTY_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</Select>
					<FieldError>{errors.propertyType?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="status">Status</Label>
					<Select id="status" {...register("status")}>
						{PROPERTY_STATUSES.map((status) => (
							<option key={status} value={status} className="capitalize">
								{status}
							</option>
						))}
					</Select>
					<FieldError>{errors.status?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="price">Price (USD)</Label>
				<Input id="price" type="number" min="0" step="1" {...register("price")} />
				<FieldError>{errors.price?.message}</FieldError>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="addressLine">Full address (private)</Label>
					<Input id="addressLine" type="text" {...register("addressLine")} />
					<FieldError>{errors.addressLine?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="cityState">City, state (public label)</Label>
					<Input id="cityState" type="text" placeholder="Austin, TX" {...register("cityState")} />
					<FieldError>{errors.cityState?.message}</FieldError>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="lat">Latitude</Label>
					<Input id="lat" type="text" inputMode="decimal" {...register("lat")} />
					<FieldError>{errors.lat?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="lng">Longitude</Label>
					<Input id="lng" type="text" inputMode="decimal" {...register("lng")} />
					<FieldError>{errors.lng?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="customFields">Custom fields (JSON)</Label>
				<textarea
					id="customFields"
					rows={5}
					{...register("customFields")}
					className="w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 font-mono text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold"
				/>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					e.g. {"{"}"beds": 3, "baths": 2, "sqft": 1800{"}"} — attributes that vary by property type.
				</p>
				<FieldError>{errors.customFields?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="assignedUserIds">Assigned agents</Label>
				<Select id="assignedUserIds" multiple size={5} {...register("assignedUserIds")}>
					{assignableUsers.map((user) => (
						<option key={user.id} value={user.id}>
							{user.full_name || user.email} ({user.role})
						</option>
					))}
				</Select>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Cmd/Ctrl-click to select more than one.
				</p>
				<FieldError>{errors.assignedUserIds?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : isEdit ? "Save changes" : "Create property"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/properties")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
