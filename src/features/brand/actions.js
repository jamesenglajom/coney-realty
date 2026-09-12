"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadMedia } from "@/features/media/storage";
import { brandSettingsSchema } from "./schemas";

// Each slot only ever needs one current file, not a browsable library, so
// this bypasses the general media library (webp-only, arbitrary filenames)
// entirely and writes to a fixed path per slot instead — a re-upload just
// overwrites (upsert: true) whatever was there. Formats are wider than the
// media library's webp-only rule since a favicon in particular needs to
// stay .ico/.png/.svg, not get forced into .webp.
const IMAGE_SLOTS = {
	logo: { mimes: ["image/webp", "image/png", "image/jpeg", "image/svg+xml"], maxBytes: 4 * 1024 * 1024 },
	favicon: { mimes: ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"], maxBytes: 1024 * 1024 },
	banner: { mimes: ["image/webp", "image/jpeg", "image/png"], maxBytes: 8 * 1024 * 1024 },
};

const EXTENSION_BY_MIME = {
	"image/webp": "webp",
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/svg+xml": "svg",
	"image/x-icon": "ico",
	"image/vnd.microsoft.icon": "ico",
};

async function uploadBrandImage(slot, file) {
	const config = IMAGE_SLOTS[slot];
	if (!config.mimes.includes(file.type)) {
		throw new Error(`${slot} must be one of: ${config.mimes.join(", ")}`);
	}
	if (file.size > config.maxBytes) {
		throw new Error(`${slot} is too large — max ${(config.maxBytes / (1024 * 1024)).toFixed(0)}MB.`);
	}

	const extension = EXTENSION_BY_MIME[file.type] ?? "bin";
	const buffer = Buffer.from(await file.arrayBuffer());
	return uploadMedia(`brand/${slot}.${extension}`, buffer, file.type);
}

// SAdmin-only via the "brand" page permission (seeded can_view/can_edit
// false for every other role — SAdmin always reads as fully-allowed
// regardless of the permissions table, per requirePermission's own rule).
// Takes FormData (not a plain object) since logo/favicon/banner are
// optional File entries alongside the regular text fields — same shape as
// uploadMediaAction elsewhere in the media feature.
export async function updateBrandSettingsAction(formData) {
	const user = await requireUser();
	if (user.role !== "SAdmin") {
		return { error: "Only a super admin can edit brand settings." };
	}

	const parsed = brandSettingsSchema.safeParse({
		siteName: formData.get("siteName"),
		colorBlue: formData.get("colorBlue"),
		colorGold: formData.get("colorGold"),
		colorGoldLight: formData.get("colorGoldLight"),
		colorGray: formData.get("colorGray"),
		address: formData.get("address"),
		contactNumber: formData.get("contactNumber"),
		contactEmail: formData.get("contactEmail"),
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const columns = {
		site_name: parsed.data.siteName,
		color_blue: parsed.data.colorBlue,
		color_gold: parsed.data.colorGold,
		color_gold_light: parsed.data.colorGoldLight,
		color_gray: parsed.data.colorGray,
		address: parsed.data.address || null,
		contact_number: parsed.data.contactNumber || null,
		contact_email: parsed.data.contactEmail || null,
		updated_by: user.id,
	};

	for (const [slot, column] of [
		["logo", "logo_url"],
		["favicon", "favicon_url"],
		["banner", "banner_url"],
	]) {
		const file = formData.get(slot);
		if (file instanceof File && file.size > 0) {
			try {
				columns[column] = await uploadBrandImage(slot, file);
			} catch (error) {
				return { error: error.message };
			}
		}
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("brand_settings").update(columns).eq("id", true);
	if (error) return { error: error.message };

	// Brand identity (colors, logo, favicon) can show up on literally any
	// page, admin or public — a scoped revalidatePath would inevitably miss
	// one.
	revalidatePath("/", "layout");
	return { success: true };
}
