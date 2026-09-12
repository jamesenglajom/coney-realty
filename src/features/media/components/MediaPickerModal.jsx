"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, ImageOff, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { listMediaAction, uploadMediaAction } from "../actions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const FOLDER_LABELS = {
	properties: "Properties",
	"agent-headshots": "Agent headshots",
	"agent-half-body": "Agent half-body",
};

const PAGE_SIZE = 24;

export default function MediaPickerModal({ open, onClose, folders, multiple = false, onSelect }) {
	const [activeFolder, setActiveFolder] = useState(folders[0]);
	const [files, setFiles] = useState(null);
	const [totalCount, setTotalCount] = useState(0);
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState([]);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (!open) return;
		setActiveFolder(folders[0]);
		setSelected([]);
		setQuery("");
		setDebouncedQuery("");
		setPage(1);
	}, [open, folders]);

	// Search is server-side (see listMediaAction) so it can be paginated too
	// — a folder with hundreds of files was otherwise loaded (and every
	// thumbnail requested) in one shot just to filter it client-side.
	// Debounced so typing doesn't fire a fetch per keystroke.
	useEffect(() => {
		if (!open) return undefined;
		const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
		return () => clearTimeout(timeout);
	}, [open, query]);

	// A folder switch or a new search term can both land past however many
	// pages the new result set actually has — always back to page 1.
	useEffect(() => {
		if (!open) return;
		setPage(1);
	}, [open, activeFolder, debouncedQuery]);

	function loadPage() {
		setFiles(null);
		listMediaAction(activeFolder, { page, pageSize: PAGE_SIZE, search: debouncedQuery })
			.then((result) => {
				setFiles(result.files);
				setTotalCount(result.totalCount);
			})
			.catch(() => {
				toast.error("Couldn't load the media library.");
				setFiles([]);
				setTotalCount(0);
			});
	}

	useEffect(() => {
		if (!open) return;
		loadPage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, activeFolder, page, debouncedQuery]);

	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	function toggle(url) {
		if (!multiple) {
			onSelect([url]);
			onClose();
			return;
		}
		setSelected((current) => (current.includes(url) ? current.filter((u) => u !== url) : [...current, url]));
	}

	function confirmSelection() {
		if (selected.length === 0) return;
		onSelect(selected);
		onClose();
	}

	async function handleFileSelect(event) {
		const chosen = Array.from(event.target.files ?? []);
		if (chosen.length === 0) return;

		const formData = new FormData();
		formData.set("folder", activeFolder);
		chosen.forEach((file) => formData.append("files", file));

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
			// New uploads sort first (most recent), so page 1 is where they'll
			// actually show up — re-fetches there even if already on page 1.
			if (page === 1) loadPage();
			else setPage(1);
		}
		if (result.failed.length > 0) {
			toast.error(`${result.failed.length} file(s) skipped — only .webp is accepted.`);
		}
	}

	if (!open) return null;

	return (
		<Modal open={open} onClose={onClose} title="Choose from media library" size="xl">
			<div className="flex flex-wrap items-center justify-between gap-3">
				{folders.length > 1 ? (
					<div className="flex gap-2">
						{folders.map((folder) => (
							<button key={folder} type="button" onClick={() => setActiveFolder(folder)}
								className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
									folder === activeFolder
										? "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue"
										: "border border-theme-gold-light text-txt-secondary hover:bg-theme-gold-light dark:border-border-dark dark:text-txt-secondary-dark dark:hover:bg-white/5"
								}`}>
								{FOLDER_LABELS[folder] ?? folder}
							</button>
						))}
					</div>
				) : (
					<span />
				)}

				<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-theme-blue px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-theme-blue/90 disabled:opacity-50 dark:bg-theme-gold dark:text-theme-blue dark:hover:bg-theme-gold/90">
					<Upload className="h-3.5 w-3.5" aria-hidden="true" />
					{isUploading ? "Uploading…" : "Upload"}
					<input
						type="file"
						accept="image/webp"
						multiple
						disabled={isUploading}
						onChange={handleFileSelect}
						className="hidden"
					/>
				</label>
			</div>

			<div className="relative mt-3">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-muted dark:text-txt-muted-dark"
					aria-hidden="true"
				/>
				<input
					type="text"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search by filename…"
					className="w-full rounded-xl border border-theme-gray/30 bg-white py-2.5 pl-9 pr-9 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-border-dark dark:bg-surface-dark-raised dark:text-txt-primary-dark dark:focus:border-theme-gold"
				/>
				{query ? (
					<button
						type="button"
						onClick={() => setQuery("")}
						aria-label="Clear search"
						className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-txt-muted hover:bg-theme-gray/10 dark:text-txt-muted-dark dark:hover:bg-white/10"
					>
						<X className="h-3.5 w-3.5" aria-hidden="true" />
					</button>
				) : null}
			</div>

			<div className="mt-4">
				{files === null ? (
					<div className="grid h-64 place-items-center text-sm text-txt-muted dark:text-txt-muted-dark">
						Loading…
					</div>
				) : files.length === 0 ? (
					<div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
						<ImageOff className="h-6 w-6 text-txt-muted dark:text-txt-muted-dark" aria-hidden="true" />
						<p className="text-sm text-txt-muted dark:text-txt-muted-dark">
							{debouncedQuery
								? `No filenames match "${debouncedQuery}".`
								: `No images in ${FOLDER_LABELS[activeFolder] ?? activeFolder} yet — upload some above.`}
						</p>
					</div>
				) : (
					<div className="grid max-h-[52vh] grid-cols-4 gap-2.5 overflow-y-auto sm:grid-cols-6">
						{files.map((file) => {
							const isSelected = selected.includes(file.url);
							return (
								<button key={file.url} type="button" onClick={() => toggle(file.url)}
									title={file.name}
									className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-all ${
										isSelected ? "ring-theme-gold" : "ring-transparent hover:ring-theme-gray/40"
									}`}>
									<Image src={file.url} alt="" fill sizes="150px" unoptimized className="object-cover" />
									{isSelected ? (
										<span className="absolute right-1 top-1 rounded-full bg-theme-gold p-0.5 text-theme-blue">
											<Check className="h-3 w-3" aria-hidden="true" />
										</span>
									) : null}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{totalPages > 1 ? (
				<div className="mt-3 flex items-center justify-between gap-2 border-t border-theme-gold-light/70 pt-3 dark:border-border-dark">
					<p className="text-xs text-txt-muted dark:text-txt-muted-dark">{totalCount} total</p>
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => setPage((current) => Math.max(1, current - 1))}
							disabled={page <= 1}
							aria-label="Previous page"
							className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-theme-gold-light disabled:pointer-events-none disabled:opacity-40 dark:text-txt-secondary-dark dark:hover:bg-white/5"
						>
							<ChevronLeft className="h-4 w-4" aria-hidden="true" />
						</button>
						<span className="px-1 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark">
							{page} / {totalPages}
						</span>
						<button
							type="button"
							onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
							disabled={page >= totalPages}
							aria-label="Next page"
							className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-theme-gold-light disabled:pointer-events-none disabled:opacity-40 dark:text-txt-secondary-dark dark:hover:bg-white/5"
						>
							<ChevronRight className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				</div>
			) : null}

			{multiple ? (
				<div className="mt-4 flex items-center justify-between gap-2">
					<p className="text-xs text-txt-muted dark:text-txt-muted-dark">{selected.length} selected</p>
					<div className="flex gap-2">
						<Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
						<Button type="button" size="sm" disabled={selected.length === 0} onClick={confirmSelection}>Use selected</Button>
					</div>
				</div>
			) : null}
		</Modal>
	);
}
