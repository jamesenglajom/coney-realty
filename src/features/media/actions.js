"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { listMediaFolder, uploadMedia, deleteMedia } from "./storage";
import { getMediaUrl, MEDIA_FOLDERS } from "./publicUrls";

function assertFolder(folder) {
	if (!MEDIA_FOLDERS.includes(folder)) throw new Error("Unknown media folder.");
}

// Keeps the uploader's own filename (lowercased, non-alphanumerics
// collapsed to hyphens) for recognizability when browsing the library,
// plus a short random suffix so two different uploads named "IMG_0001"
// never collide/overwrite each other.
function buildStorageFilename(originalName) {
	const base = originalName.replace(/\.[a-z0-9]+$/i, "");
	const slug =
		base
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 60) || "image";
	const suffix = crypto.randomBytes(4).toString("hex");
	return `${slug}-${suffix}.webp`;
}

// Used by both the /admin/media library page and every picker modal
// embedded in another form — browsing the library is a "view" on the
// media page regardless of which feature's form opened it. Storage's own
// list() has no cheap "total count" alongside a page of results, so this
// fetches the full (folder-sized, never huge) listing and searches/paginates
// in JS — { page } is opt-in: called with no second argument, this still
// returns the full array, unchanged from before (a handful of call sites
// genuinely want everything, not a page of it).
export async function listMediaAction(folder, { page, pageSize = 24, search } = {}) {
	await requirePermission("media", "view");
	assertFolder(folder);

	const files = await listMediaFolder(folder);
	let mapped = files
		.map((file) => ({
			name: file.name,
			url: getMediaUrl(`${folder}/${file.name}`),
			updatedAt: file.updated_at,
		}))
		.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

	const needle = search?.trim().toLowerCase();
	if (needle) mapped = mapped.filter((file) => file.name.toLowerCase().includes(needle));

	if (!page) return mapped;

	const from = (page - 1) * pageSize;
	return { files: mapped.slice(from, from + pageSize), totalCount: mapped.length };
}

// Bulk upload — accepts a FormData with `folder` and one or more `files`
// entries. webp-only is enforced here too (not just the bucket's own mime
// allowlist), so a rejected file gets a clear per-file reason back instead
// of a generic Storage error.
export async function uploadMediaAction(formData) {
	await requirePermission("media", "create");

	const folder = formData.get("folder");
	assertFolder(folder);

	const files = formData.getAll("files").filter((f) => f instanceof File && f.size > 0);
	if (files.length === 0) return { error: "No files to upload." };

	const uploaded = [];
	const failed = [];

	for (const file of files) {
		if (file.type !== "image/webp") {
			failed.push({ name: file.name, reason: "Not a .webp file" });
			continue;
		}
		try {
			const filename = buildStorageFilename(file.name);
			const buffer = Buffer.from(await file.arrayBuffer());
			const url = await uploadMedia(`${folder}/${filename}`, buffer, "image/webp");
			uploaded.push({ name: filename, url });
		} catch (error) {
			failed.push({ name: file.name, reason: error.message });
		}
	}

	revalidatePath("/admin/media");
	return { success: true, uploaded, failed };
}

export async function deleteMediaAction(folder, filename) {
	await requirePermission("media", "delete");
	assertFolder(folder);

	await deleteMedia(`${folder}/${filename}`);
	revalidatePath("/admin/media");
	return { success: true };
}
