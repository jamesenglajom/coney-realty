"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBrandSettingsAction } from "../actions";
import BrandImageField from "./BrandImageField";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

function ColorField({ label, name, defaultValue }) {
	const [value, setValue] = useState(defaultValue);
	const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value);

	return (
		<div>
			<Label htmlFor={name}>{label}</Label>
			<div className="flex items-center gap-2.5">
				<input
					type="color"
					value={isValidHex ? value : "#000000"}
					onChange={(event) => setValue(event.target.value)}
					aria-label={`${label} color picker`}
					className="h-10 w-11 shrink-0 cursor-pointer rounded-lg border border-theme-gray/25 bg-transparent p-1 dark:border-border-dark"
				/>
				<Input
					id={name}
					name={name}
					type="text"
					value={value}
					onChange={(event) => setValue(event.target.value)}
					className="font-mono uppercase"
					maxLength={7}
				/>
			</div>
		</div>
	);
}

// Plain native-form submit (FormData, not react-hook-form) — logo/favicon/
// banner are optional <input type="file"> fields living alongside the text
// fields in the same form, and FormData picks those up by `name` for free
// on a native submit; fighting RHF to carry File objects through its own
// validated-object flow would buy nothing here. Server-side zod validation
// (brandSettingsSchema) is still the source of truth — errors come back
// from the action and surface as a toast.
export default function BrandSettingsForm({ brand }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		startTransition(async () => {
			const result = await updateBrandSettingsAction(formData);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Brand settings saved.");
			router.refresh();
		});
	}

	return (
		<form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
			<section>
				<h2 className="text-sm font-bold text-theme-blue dark:text-white">Identity</h2>
				<div className="mt-4 space-y-4">
					<div>
						<Label htmlFor="siteName">Site name</Label>
						<Input id="siteName" name="siteName" type="text" defaultValue={brand.siteName} />
					</div>
					<BrandImageField
						label="Logo"
						name="logo"
						currentUrl={brand.logoUrl}
						accept="image/webp,image/png,image/jpeg,image/svg+xml"
						hint="Shown in the admin sidebar, login page, and public header/footer. WebP, PNG, JPEG, or SVG — up to 4MB."
					/>
					<BrandImageField
						label="Favicon"
						name="favicon"
						currentUrl={brand.faviconUrl}
						accept="image/x-icon,image/png,image/svg+xml"
						hint="The browser-tab icon. ICO, PNG, or SVG — up to 1MB."
						previewClassName="h-11 w-11"
					/>
					<BrandImageField
						label="Home banner"
						name="banner"
						currentUrl={brand.bannerUrl}
						accept="image/webp,image/jpeg,image/png"
						hint="The full-width photo behind the homepage search. WebP, JPEG, or PNG — up to 8MB."
						previewClassName="h-16 w-28"
					/>
				</div>
			</section>

			<section>
				<h2 className="text-sm font-bold text-theme-blue dark:text-white">Color palette</h2>
				<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">
					Applies across the entire site — admin and public — the moment you save.
				</p>
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					<ColorField label="Primary (blue)" name="colorBlue" defaultValue={brand.colorBlue} />
					<ColorField label="Accent (gold)" name="colorGold" defaultValue={brand.colorGold} />
					<ColorField label="Gold — light tint" name="colorGoldLight" defaultValue={brand.colorGoldLight} />
					<ColorField label="Neutral (gray)" name="colorGray" defaultValue={brand.colorGray} />
				</div>
			</section>

			<section>
				<h2 className="text-sm font-bold text-theme-blue dark:text-white">Contact details</h2>
				<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown in the public site footer. Leave a field blank to hide it.
				</p>
				<div className="mt-4 space-y-4">
					<div>
						<Label htmlFor="address">Address</Label>
						<Textarea id="address" name="address" rows={3} defaultValue={brand.address} />
					</div>
					<div>
						<Label htmlFor="contactNumber">Contact number</Label>
						<Input id="contactNumber" name="contactNumber" type="tel" autoComplete="off" defaultValue={brand.contactNumber} />
					</div>
					<div>
						<Label htmlFor="contactEmail">Contact email</Label>
						<Input id="contactEmail" name="contactEmail" type="email" autoComplete="off" defaultValue={brand.contactEmail} />
					</div>
				</div>
			</section>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Save brand settings"}
			</Button>
		</form>
	);
}
