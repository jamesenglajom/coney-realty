"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import {
	createPropertySchema,
	updatePropertySchema,
	PROPERTY_TYPES,
	PROPERTY_STATUSES,
	PAYMENT_TYPES,
} from "../schemas";
import { createPropertyAction, updatePropertyAction, reverseGeocodeAction } from "../actions";
import { omitPaths, pickPaths, deepMerge, flattenToPairs, buildFromPairs } from "@/features/propertyTypes/fieldPaths";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";
import AdditionalFieldsEditor from "./AdditionalFieldsEditor";
import HtmlBodyEditor from "./HtmlBodyEditor";

function slugify(value) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

// The property form still submits one `customFields` JSON string, matching
// createPropertySchema/updatePropertySchema server-side exactly as before —
// standardFields (structured, per property type — see Admin > Property
// Types) and additionalFieldPairs (freeform key/value rows, everything
// else) are purely client-side UI concepts that get merged into that one
// string right before the action call.
export default function PropertyForm({ mode, property, assignableUsers, fieldSetsByType = {} }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const isEdit = mode === "edit";

	const initialCustomFields = property?.custom_fields ?? {};
	const initialActiveFields = fieldSetsByType[isEdit ? property.property_type : PROPERTY_TYPES[0]] ?? [];

	const {
		register,
		control,
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
					screenName: property.screen_name ?? "",
					slug: property.slug,
					propertyType: property.property_type,
					status: property.status,
					price: property.price != null ? String(property.price) : "",
					addressLine: property.address_line ?? "",
					cityState: property.city_state ?? "",
					city: property.city ?? "",
					region: property.region ?? "",
					district: property.district ?? "",
					zoneType: property.zone_type ?? "",
					paymentType: property.payment_type ?? "",
					paymentTerms: property.payment_terms ?? "",
					lat: property.lat != null ? String(property.lat) : "",
					lng: property.lng != null ? String(property.lng) : "",
					htmlBody: property.html_body ?? "",
					// Overwritten from standardFields + additionalFields on submit —
					// this default just needs to be *some* valid JSON string so the
					// zod resolver's shape check trivially passes.
					customFields: "{}",
					standardFields: initialCustomFields,
					additionalFieldPairs: flattenToPairs(
						omitPaths(
							initialCustomFields,
							initialActiveFields.map((field) => field.key),
						),
					),
					assignedUserIds: property.assignedUserIds ?? [],
				}
			: {
					title: "",
					screenName: "",
					slug: "",
					propertyType: PROPERTY_TYPES[0],
					status: PROPERTY_STATUSES[0],
					price: "",
					addressLine: "",
					cityState: "",
					city: "",
					region: "",
					district: "",
					zoneType: "",
					paymentType: "",
					paymentTerms: "",
					lat: "",
					lng: "",
					htmlBody: "",
					customFields: "{}",
					standardFields: {},
					additionalFieldPairs: [],
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

	const [isGeocoding, startGeocode] = useTransition();

	function handleAutofillFromCoordinates() {
		const lat = watch("lat");
		const lng = watch("lng");

		if (!lat || !lng) {
			toast.error("Enter latitude and longitude first.");
			return;
		}

		startGeocode(async () => {
			const result = await reverseGeocodeAction(lat, lng);

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			if (result.addressLine) setValue("addressLine", result.addressLine, { shouldValidate: true });
			if (result.city) {
				setValue("city", result.city, { shouldValidate: true });
				setValue("cityState", result.city, { shouldValidate: true });
			}
			if (result.region) setValue("region", result.region, { shouldValidate: true });
			if (result.district) setValue("district", result.district, { shouldValidate: true });

			toast.success("Address filled in from coordinates — double-check before saving.");
		});
	}

	const selectedPropertyType = watch("propertyType");
	const activeFields = fieldSetsByType[selectedPropertyType] ?? [];

	function onSubmit(values) {
		setServerError("");

		const additionalFields = buildFromPairs(values.additionalFieldPairs);
		const standardValues = pickPaths(
			values.standardFields ?? {},
			activeFields.map((field) => field.key),
		);
		const customFields = deepMerge(additionalFields, standardValues);

		startTransition(async () => {
			const action = isEdit ? updatePropertyAction : createPropertyAction;
			const result = await action({ ...values, customFields: JSON.stringify(customFields) });

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

			<div>
				<Label htmlFor="screenName">Screen name (public)</Label>
				<Input id="screenName" type="text" placeholder="Defaults to Title if left blank" {...register("screenName")} />
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown on the public site instead of Title when set — lets you post it under a different name than the
					internal listing title.
				</p>
				<FieldError>{errors.screenName?.message}</FieldError>
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
				<Label htmlFor="price">Price (PHP)</Label>
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

			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<Label htmlFor="city">City</Label>
					<Input id="city" type="text" {...register("city")} />
					<FieldError>{errors.city?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="region">Region</Label>
					<Input id="region" type="text" {...register("region")} />
					<FieldError>{errors.region?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="district">District</Label>
					<Input id="district" type="text" {...register("district")} />
					<FieldError>{errors.district?.message}</FieldError>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="zoneType">Zone type</Label>
					<Input id="zoneType" type="text" placeholder="Residential, Commercial, Mixed-use…" {...register("zoneType")} />
					<FieldError>{errors.zoneType?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="paymentType">Payment type</Label>
					<Select id="paymentType" {...register("paymentType")}>
						<option value="">—</option>
						{PAYMENT_TYPES.map((type) => (
							<option key={type} value={type} className="capitalize">
								{type}
							</option>
						))}
					</Select>
					<FieldError>{errors.paymentType?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="paymentTerms">Payment terms</Label>
				<Input
					id="paymentTerms"
					type="text"
					placeholder="20% down, balance in 24 months"
					{...register("paymentTerms")}
				/>
				<FieldError>{errors.paymentTerms?.message}</FieldError>
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
				<Button type="button" variant="ghost" size="sm" disabled={isGeocoding} onClick={handleAutofillFromCoordinates}>
					<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
					{isGeocoding ? "Looking up address…" : "Autofill address from coordinates"}
				</Button>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Fills in full address, city, region, and district from the lat/lng above using OpenStreetMap — always
					double-check before saving.
				</p>
			</div>

			<div>
				<Label htmlFor="htmlBody">Description</Label>
				<p className="mb-2 -mt-0.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown on the public property page, below the key facts.
				</p>
				<Controller
					name="htmlBody"
					control={control}
					render={({ field }) => <HtmlBodyEditor value={field.value} onChange={field.onChange} />}
				/>
				<FieldError>{errors.htmlBody?.message}</FieldError>
			</div>

			{activeFields.length > 0 ? (
				<div>
					<Label className="mb-0">Standard fields for {selectedPropertyType}</Label>
					<p className="mb-2 mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">
						Configured in Admin &gt; Property Types.
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						{activeFields.map((field) => (
							<div key={field.key}>
								<Label htmlFor={`standardFields.${field.key}`}>
									{field.label}
									{field.required ? <span className="text-red-600 dark:text-red-400"> *</span> : null}
									{field.unit ? (
										<span className="font-normal normal-case text-txt-muted dark:text-txt-muted-dark"> ({field.unit})</span>
									) : null}
								</Label>
								<Input
									id={`standardFields.${field.key}`}
									type={field.type === "number" ? "number" : "text"}
									{...register(`standardFields.${field.key}`, field.type === "number" ? { valueAsNumber: true } : {})}
								/>
							</div>
						))}
					</div>
				</div>
			) : null}

			<AdditionalFieldsEditor control={control} register={register} />

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
