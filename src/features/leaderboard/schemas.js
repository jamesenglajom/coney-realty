import { z } from "zod";

export const leaderboardEntrySchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	title: z.string().trim().optional(),
	photoUrl: z.string().trim().optional(),
	agentId: z.string().uuid().optional().or(z.literal("")),
});

export const leaderboardConfigSchema = z.object({
	heading: z.string().trim().optional(),
	periodLabel: z.string().trim().optional(),
	isPublished: z.boolean(),
	showRanks6To10: z.boolean(),
});
