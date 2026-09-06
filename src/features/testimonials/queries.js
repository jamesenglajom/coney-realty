import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgentPhotos } from "@/features/users/imageFs";
import { getAvatarForSeed } from "@/features/homepage/data";
import { getTestimonialPhoto } from "./imageFs";

const TESTIMONIAL_COLUMNS =
	"id, quote, client_name, agent_display_name, agent_tagline, slug, agent_id, display_order, users(id, full_name, user_info(avatar_url))";

function mapTestimonialRow(row) {
	return {
		id: row.id,
		quote: row.quote,
		clientName: row.client_name,
		agentDisplayName: row.agent_display_name,
		agentTagline: row.agent_tagline,
		slug: row.slug,
		agentId: row.agent_id,
		displayOrder: row.display_order,
		agentName: row.users?.full_name ?? null,
		agentAvatarUrl: row.users?.user_info?.avatar_url ?? null,
	};
}

// Photo resolution, shared by the admin list and the public homepage read so
// the two never disagree on which photo a testimonial shows: the
// testimonial's own static file (public/testimonials/, named by slug or id —
// see ./imageFs) wins, then the linked agent's photo library (medium ->
// three_quarter -> face, whichever exists first — see
// src/features/users/imageFs.js), then their account avatar, then a
// deterministic placeholder.
function resolvePhoto(testimonial) {
	let photo = getTestimonialPhoto(testimonial);

	if (!photo && testimonial.agentId) {
		const libraryPhotos = getAgentPhotos(testimonial.agentId);
		photo = libraryPhotos.medium || libraryPhotos.three_quarter || libraryPhotos.face || null;
	}

	return photo || testimonial.agentAvatarUrl || getAvatarForSeed(testimonial.id);
}

// Admin view — every non-deleted testimonial in carousel order, with its
// photo already resolved (see resolvePhoto above).
export async function listTestimonials() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("testimonials")
		.select(TESTIMONIAL_COLUMNS)
		.is("deleted_at", null)
		.order("display_order", { ascending: true });

	if (error) throw new Error(error.message);
	return (data ?? [])
		.map(mapTestimonialRow)
		.map((testimonial) => ({ ...testimonial, photo: resolvePhoto(testimonial) }));
}

// Homepage read — public-safe subset of listTestimonials, same photo
// resolution. Degrades to an empty list on any error (e.g. the migration
// hasn't been run yet) so a testimonials problem never takes down the
// homepage.
export async function getPublicTestimonials() {
	try {
		const testimonials = await listTestimonials();

		return testimonials.map((testimonial) => ({
			id: testimonial.id,
			quote: testimonial.quote,
			clientName: testimonial.clientName,
			agentDisplayName: testimonial.agentDisplayName,
			agentTagline: testimonial.agentTagline,
			agentId: testimonial.agentId,
			photo: testimonial.photo,
		}));
	} catch {
		return [];
	}
}
