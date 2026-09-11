"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Copy, Check, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { listMediaAction, uploadMediaAction, deleteMediaAction } from "../actions";
import { MEDIA_FOLDERS } from "../publicUrls";

const FOLDER_LABELS = {
	properties: "Properties",
	"agent-headshots": "Agent headshots",
	"agent-half-body": "Agent half-body",
};

function CopyUrlButton({ url }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Couldn't copy — copy the URL manually.");
		}
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label="Copy image URL"
			className="inline-flex items-center justify-center rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
		>
			{copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
		</button>
	);
}

export default function MediaLibraryClient({ initialFolder, initialFiles, canUpload, canDelete }) {
	const [folder, setFolder] = useState(initialFolder);
	const [files, setFiles] = useState(initialFiles);
	const [isPending, startTransition] = useTransition();
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);

	function switchFolder(nextFolder) {
		if (nextFolder === folder) return;
		setFolder(nextFolder);
		startTransition(async () => {
			const result = await listMediaAction(nextFolder);
			setFiles(result);
		});
	}

	async function refresh() {
		const result = await listMediaAction(folder);
		setFiles(result);
	}

	async function handleFileSelect(event) {
		const selected = Array.from(event.target.files ?? []);
		if (selected.length === 0) return;

		const formData = new FormData();
		formData.set("folder", folder);
		selected.forEach((file) => formData.append("files", file));

		setIsUploading(true);
		const result = await uploadMediaAction(formData);
		setIsUploading(false);
		event.target.value = "";

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		if (result.uploaded.length > 0) {
			toast.success(`Uploaded ${result.uploaded.length} image${result.uploaded.length === 1 ? "" : "s"}.`);
		}
		if (result.failed.length > 0) {
			toast.error(`${result.failed.length} file(s) skipped — only .webp is accepted.`);
		}
		if (result.uploaded.length > 0) await refresh();
	}

	function handleDelete(file) {
		if (!window.confirm(`Delete "${file.name}"? This can't be undone, and any form still pointing at it will break.`)) {
			return;
		}
		startTransition(async () => {
			const result = await deleteMediaAction(folder, file.name);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Deleted.");
			setFiles((current) => current.filter((f) => f.name !== file.name));
		});
	}

	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap gap-2">
					{MEDIA_FOLDERS.map((f) => (
						<button
							key={f}
							type="button"
							onClick={() => switchFolder(f)}
							className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
								f === folder
									? "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue"
									: "border border-theme-gold-light text-txt-secondary hover:bg-theme-gold-light dark:border-border-dark dark:text-txt-secondary-dark dark:hover:bg-white/5"
							}`}
						>
							{FOLDER_LABELS[f]}
						</button>
					))}
				</div>

				{canUpload ? (
					<label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-theme-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-theme-blue/90 disabled:opacity-50 dark:bg-theme-gold dark:text-theme-blue dark:hover:bg-theme-gold/90">
						<Upload className="h-4 w-4" aria-hidden="true" />
						{isUploading ? "Uploading…" : "Upload images"}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/webp"
							multiple
							disabled={isUploading}
							onChange={handleFileSelect}
							className="hidden"
						/>
					</label>
				) : null}
			</div>
			<p className="mt-2 text-xs text-txt-muted dark:text-txt-muted-dark">
				.webp only — any filename. Pick multiple files at once for a bulk upload.
			</p>

			<div className={`mt-6 transition-opacity ${isPending ? "opacity-50" : ""}`}>
				{files.length === 0 ? (
					<div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-theme-gold-light p-16 text-center dark:border-border-dark">
						<ImageOff className="h-8 w-8 text-txt-muted dark:text-txt-muted-dark" aria-hidden="true" />
						<p className="text-sm text-txt-muted dark:text-txt-muted-dark">
							No images in {FOLDER_LABELS[folder]} yet.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{files.map((file) => (
							<div
								key={file.name}
								className="group relative aspect-square overflow-hidden rounded-2xl border border-theme-gold-light/70 bg-theme-gray/5 dark:border-border-dark dark:bg-white/5"
							>
								<Image src={file.url} alt="" fill sizes="200px" className="object-cover" unoptimized />
								<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<div className="pointer-events-none absolute inset-x-0 bottom-0 truncate p-2 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
									{file.name}
								</div>
								<div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<CopyUrlButton url={file.url} />
									{canDelete ? (
										<button
											type="button"
											onClick={() => handleDelete(file)}
											aria-label={`Delete ${file.name}`}
											className="inline-flex items-center justify-center rounded-lg bg-black/60 p-1.5 text-white hover:bg-danger"
										>
											<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
										</button>
									) : null}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
