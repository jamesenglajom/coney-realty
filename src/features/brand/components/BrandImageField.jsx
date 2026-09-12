"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import Label from "@/components/ui/Label";

// Logo/favicon/banner each get one of these — a preview of whatever's
// currently saved, swapped for a local object-URL preview the moment a new
// file is picked (before the form is even submitted), so there's no
// "did that actually select?" uncertainty. The real upload only happens on
// Save, alongside the rest of the form (see BrandSettingsForm).
export default function BrandImageField({ label, name, currentUrl, accept, hint, previewClassName }) {
	const [previewUrl, setPreviewUrl] = useState(null);
	const [fileName, setFileName] = useState(null);

	function handleChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		setPreviewUrl(URL.createObjectURL(file));
		setFileName(file.name);
	}

	const displayUrl = previewUrl || currentUrl;

	return (
		<div>
			<Label>{label}</Label>
			<div className="flex items-center gap-3">
				<div
					className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-theme-gray/25 bg-theme-gold-light dark:border-border-dark dark:bg-white/5 ${previewClassName ?? "h-16 w-16"}`}
				>
					{displayUrl ? (
						// eslint-disable-next-line @next/next/no-img-element -- arbitrary
						// formats (.ico/.svg) that next/image's optimizer doesn't handle
						// well, in a small admin-only preview slot.
						<img src={displayUrl} alt="" className="h-full w-full object-contain p-1.5" />
					) : null}
				</div>
				<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-theme-gold-light px-3.5 py-2 text-xs font-semibold text-theme-blue transition-colors hover:bg-theme-gold-light dark:border-border-dark dark:text-theme-gold dark:hover:bg-white/5">
					<Upload className="h-3.5 w-3.5" aria-hidden="true" />
					{fileName ? "Change file" : "Upload"}
					<input type="file" name={name} accept={accept} onChange={handleChange} className="hidden" />
				</label>
				{fileName ? (
					<span className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">{fileName}</span>
				) : null}
			</div>
			{hint ? <p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">{hint}</p> : null}
		</div>
	);
}
