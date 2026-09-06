import { z } from "zod";

export const testimonialSchema = z.object({
	quote: z.string().trim().min(1, "Quote is required"),
	clientName: z.string().trim().min(1, "Client name is required"),
	agentDisplayName: z.string().trim().min(1, "Agent name is required"),
	agentTagline: z.string().trim().optional(),
	// Optional filename key for the testimonial's own photo (public/
	// testimonials/{slug}.webp) — falls back to the row's id when left
	// blank, so this is a nicety, not a requirement.
	slug: z
		.string()
		.trim()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only")
		.optional()
		.or(z.literal("")),
	agentId: z.string().uuid().optional().or(z.literal("")),
});
