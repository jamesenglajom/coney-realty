"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/features/homepage/data";
import { scheduleViewingSchema } from "../schemas";
import { submitViewingRequestAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

const TIME_OPTIONS = [
	{ value: "", label: "No preference" },
	{ value: "morning", label: "Morning" },
	{ value: "afternoon", label: "Afternoon" },
	{ value: "evening", label: "Evening" },
];

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

export default function ScheduleViewingForm({ propertyOptions, preselectedIds }) {
	const [isPending, startTransition] = useTransition();
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [filterText, setFilterText] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(scheduleViewingSchema),
		defaultValues: {
			visitorName: "",
			visitorEmail: "",
			visitorPhone: "",
			propertyIds: preselectedIds,
			preferredDate: "",
			preferredTime: "",
			message: "",
		},
	});

	const selectedIds = watch("propertyIds") ?? [];

	const filteredOptions = useMemo(() => {
		const query = filterText.trim().toLowerCase();
		if (!query) return propertyOptions;
		return propertyOptions.filter((property) =>
			`${property.name} ${property.city ?? ""}`.toLowerCase().includes(query),
		);
	}, [propertyOptions, filterText]);

	const selectedProperties = useMemo(
		() => propertyOptions.filter((property) => selectedIds.includes(property.id)),
		[propertyOptions, selectedIds],
	);

	function removeSelectedProperty(propertyId) {
		setValue(
			"propertyIds",
			selectedIds.filter((id) => id !== propertyId),
			{ shouldValidate: true, shouldDirty: true },
		);
	}

	function onSubmit(values) {
		startTransition(async () => {
			const result = await submitViewingRequestAction(values);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			setIsSubmitted(true);
		});
	}

	if (isSubmitted) {
		return (
			<div className="rounded-2xl border border-theme-gold-light bg-theme-gold-light/40 p-8 text-center dark:border-border-dark dark:bg-white/[0.03]">
				<CheckCircle2 className="mx-auto h-10 w-10 text-theme-blue dark:text-theme-gold" aria-hidden="true" />
				<h3 className="mt-4 font-display text-xl font-semibold text-theme-blue dark:text-white">
					Request received
				</h3>
				<p className="mt-2 text-sm text-txt-secondary dark:text-txt-secondary-dark">
					An agent will reach out shortly to confirm your viewing.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="visitorName">Full name</Label>
					<Input id="visitorName" autoComplete="name" {...register("visitorName")} />
					<FieldError>{errors.visitorName?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="visitorEmail">Email</Label>
					<Input id="visitorEmail" type="email" autoComplete="email" {...register("visitorEmail")} />
					<FieldError>{errors.visitorEmail?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="visitorPhone">Phone (optional)</Label>
					<Input id="visitorPhone" type="tel" autoComplete="tel" {...register("visitorPhone")} />
					<FieldError>{errors.visitorPhone?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label>Properties you'd like to visit</Label>

				<div className="mb-3 rounded-xl border border-theme-gray/20 p-3 dark:border-white/10">
					<p className="text-xs font-semibold uppercase tracking-wide text-txt-muted dark:text-txt-muted-dark">
						Selected {selectedProperties.length > 0 ? `(${selectedProperties.length})` : ""}
					</p>
					{selectedProperties.length === 0 ? (
						<p className="mt-1.5 text-sm text-txt-muted dark:text-txt-muted-dark">
							None yet — check one or more properties below.
						</p>
					) : (
						<ul className="mt-2 flex flex-wrap gap-2">
							{selectedProperties.map((property) => (
								<li key={property.id}>
									<button
										type="button"
										onClick={() => removeSelectedProperty(property.id)}
										className="inline-flex items-center gap-2 rounded-full bg-theme-gold/20 py-1 pl-1 pr-2.5 text-xs font-medium text-theme-blue transition-colors hover:bg-theme-gold/30 dark:text-theme-gold"
									>
										<span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
											<Image src={property.image} alt="" fill sizes="24px" className="object-cover" />
										</span>
										<span>
											{property.name}
											{property.price != null ? <span className="ml-1 opacity-80">· {formatPrice(property.price)}</span> : null}
										</span>
										<X className="h-3.5 w-3.5" aria-hidden="true" />
										<span className="sr-only">Remove {property.name}</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="relative mb-3">
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-muted dark:text-txt-muted-dark"
						aria-hidden="true"
					/>
					<Input
						type="text"
						placeholder="Filter properties…"
						value={filterText}
						onChange={(event) => setFilterText(event.target.value)}
						className="pl-9"
					/>
				</div>

				{filteredOptions.length === 0 ? (
					<p className="rounded-xl border border-theme-gray/20 p-6 text-center text-sm text-txt-muted dark:border-white/10 dark:text-txt-muted-dark">
						No properties match "{filterText}".
					</p>
				) : (
					<div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-theme-gray/20 p-2 dark:border-white/10">
						{filteredOptions.map((property) => {
							const isSelected = selectedIds.includes(property.id);
							return (
								<label
									key={property.id}
									className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-sm transition-colors ${
										isSelected
											? "bg-theme-gold/15 dark:bg-theme-gold/10"
											: "hover:bg-theme-gold-light/40 dark:hover:bg-white/5"
									}`}
								>
									<input
										type="checkbox"
										value={property.id}
										className="h-4 w-4 shrink-0 accent-theme-gold"
										{...register("propertyIds")}
									/>
									<span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-theme-gray/10 dark:bg-white/5">
										<Image src={property.image} alt="" fill sizes="48px" className="object-cover" />
									</span>
									<span className="min-w-0">
										<span className="block truncate font-medium text-theme-blue dark:text-white">{property.name}</span>
										<span className="block truncate text-xs text-txt-muted dark:text-txt-muted-dark">
											{[property.city, property.price != null ? formatPrice(property.price) : null]
												.filter(Boolean)
												.join(" · ")}
										</span>
									</span>
								</label>
							);
						})}
					</div>
				)}
				<FieldError>{errors.propertyIds?.message}</FieldError>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="preferredDate">Preferred date (optional)</Label>
					<Input id="preferredDate" type="date" min={todayIso()} {...register("preferredDate")} />
					<FieldError>{errors.preferredDate?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="preferredTime">Preferred time of day</Label>
					<Select id="preferredTime" {...register("preferredTime")}>
						{TIME_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor="message">Anything else? (optional)</Label>
				<Textarea id="message" rows={4} {...register("message")} />
				<FieldError>{errors.message?.message}</FieldError>
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Sending…" : "Request a viewing"}
			</Button>
		</form>
	);
}
