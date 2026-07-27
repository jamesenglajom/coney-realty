import { z } from "zod";

export const BLOG_STATUSES = ["draft", "published"];

const propertyIdField = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined));

const blogBaseSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	slug: z
		.string()
		.trim()
		.min(1, "Slug is required")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
	status: z.enum(BLOG_STATUSES),
	excerpt: z.string().trim().optional(),
	content: z.string().trim().optional(),
	coverImageUrl: z.string().trim().optional(),
	authorId: z.string().trim().min(1, "Author is required"),
	propertyId: propertyIdField,
});

export const createBlogSchema = blogBaseSchema;
export const updateBlogSchema = blogBaseSchema.extend({ id: z.string().uuid() });
