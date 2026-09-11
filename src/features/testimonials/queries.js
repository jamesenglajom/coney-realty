import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvatarForSeed } from "@/features/homepage/data";

const TESTIMONIAL_COLUMNS =
	"id, quote, client_name, agent_display_name, agent_tagline, photo_url, agent_id, display_order, users(id, full_name, user_info(avatar_url))";

function mapTestimonialRow(row) {
	return {
		id: row.id,
		quote: row.quote,
		clientName: row.client_name,
		agentDisplayName: row.agent_display_name,
		agentTagline: row.agent_tagline,
		photoUrl: row.photo_url,
		agentId: row.agent_id,
		displayOrder: row.display_order,
		agentName: row.users?.full_name ?? null,
		agentAvatarUrl: row.users?.user_info?.avatar_url ?? null,
	};
}

// Photo resolution, shared by the admin list and the public homepage read:
// the testimonial's own photo_url (set via the media library picker in
// TestimonialModal — browses agent-half-body) wins, then the linked
// agent's account avatar, then a deterministic placeholder. There's no
// "search the agent's photo library automatically" tier anymore — once
// library filenames are arbitrary (not {user_id}_<shot>.webp), there's no
// reliable way to know which library photo belongs to which agent without
// it being explicitly picked.
function resolvePhoto(testimonial) {
	return testimonial.photoUrl || testimonial.agentAvatarUrl || getAvatarForSeed(testimonial.id);
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
