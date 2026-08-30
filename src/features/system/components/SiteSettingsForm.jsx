"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { siteSettingsSchema } from "../schemas";
import { updateSiteSettingsAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function SiteSettingsForm({ settings }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(siteSettingsSchema),
		defaultValues: {
			address: settings?.address ?? "",
			contactNumber: settings?.contactNumber ?? "",
			contactEmail: settings?.contactEmail ?? "",
		},
	});

	function onSubmit(values) {
		startTransition(async () => {
			const result = await updateSiteSettingsAction(values);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Site details updated.");
			router.refresh();
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
			<p className="text-sm text-txt-muted dark:text-txt-muted-dark">
				Shown in the public site footer. Leave a field blank to hide it.
			</p>

			<div>
				<Label htmlFor="address">Address</Label>
				<Textarea id="address" rows={3} {...register("address")} />
				<FieldError>{errors.address?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="contactNumber">Contact number</Label>
				<Input id="contactNumber" type="tel" autoComplete="off" {...register("contactNumber")} />
				<FieldError>{errors.contactNumber?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="contactEmail">Contact email</Label>
				<Input id="contactEmail" type="email" autoComplete="off" {...register("contactEmail")} />
				<FieldError>{errors.contactEmail?.message}</FieldError>
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Save site details"}
			</Button>
		</form>
	);
}
