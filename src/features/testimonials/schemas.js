import { z } from "zod";

export const testimonialSchema = z.object({
	quote: z.string().trim().min(1, "Quote is required"),
	clientName: z.string().trim().min(1, "Client name is required"),
	agentDisplayName: z.string().trim().min(1, "Agent name is required"),
	agentTagline: z.string().trim().optional(),
	// Set via the media library picker (agent-headshots folder), not typed
	// in by hand — see TestimonialModal.
	photoUrl: z.string().trim().optional().or(z.literal("")),
	agentId: z.string().uuid().optional().or(z.literal("")),
});
