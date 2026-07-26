"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBlogSchema, updateBlogSchema, BLOG_STATUSES } from "../schemas";
import { createBlogAction, updateBlogAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

function slugify(value) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

const TEXTAREA_CLASSES =
	"w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold";

export default function BlogForm({ mode, blog, authors, properties, currentUserId }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const isEdit = mode === "edit";

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(isEdit ? updateBlogSchema : createBlogSchema),
		defaultValues: isEdit
			? {
					id: blog.id,
					title: blog.title,
					slug: blog.slug,
					status: blog.status,
					excerpt: blog.excerpt ?? "",
					content: blog.content ?? "",
					authorId: blog.author_id ?? currentUserId,
					propertyId: blog.property_id ?? "",
				}
			: {
					title: "",
					slug: "",
					status: BLOG_STATUSES[0],
					excerpt: "",
					content: "",
					authorId: currentUserId,
					propertyId: "",
				},
	});

	// Auto-derive the slug from the title as the user types, until they
	// manually edit the slug field themselves — then it's theirs to control.
	const slugTouchedRef = useRef(isEdit);
	const titleValue = watch("title");

	useEffect(() => {
		if (slugTouchedRef.current) return;
		setValue("slug", slugify(titleValue || ""), { shouldValidate: false });
	}, [titleValue, setValue]);

	const { onChange: onSlugChange, ...slugField } = register("slug");

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const action = isEdit ? updateBlogAction : createBlogAction;
			const result = await action(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			toast.success(isEdit ? "Post updated." : "Post created.");
			router.push("/admin/blogs");
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-4">
			{isEdit ? <input type="hidden" {...register("id")} /> : null}

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="title">Title</Label>
					<Input id="title" type="text" {...register("title")} />
					<FieldError>{errors.title?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						type="text"
						{...slugField}
						onChange={(event) => {
							slugTouchedRef.current = true;
							onSlugChange(event);
						}}
					/>
					<FieldError>{errors.slug?.message}</FieldError>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="authorId">Author</Label>
					<Select id="authorId" {...register("authorId")}>
						{authors.map((author) => (
							<option key={author.id} value={author.id}>
								{author.full_name || author.email}
							</option>
						))}
					</Select>
					<FieldError>{errors.authorId?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="status">Status</Label>
					<Select id="status" {...register("status")}>
						{BLOG_STATUSES.map((status) => (
							<option key={status} value={status} className="capitalize">
								{status}
							</option>
						))}
					</Select>
					<FieldError>{errors.status?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="propertyId">Related property (optional)</Label>
				<Select id="propertyId" {...register("propertyId")}>
					<option value="">None</option>
					{properties.map((property) => (
						<option key={property.id} value={property.id}>
							{property.title}
						</option>
					))}
				</Select>
				<FieldError>{errors.propertyId?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="excerpt">Excerpt</Label>
				<textarea id="excerpt" rows={2} {...register("excerpt")} className={TEXTAREA_CLASSES} />
				<FieldError>{errors.excerpt?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="content">Content</Label>
				<textarea id="content" rows={10} {...register("content")} className={TEXTAREA_CLASSES} />
				<FieldError>{errors.content?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/blogs")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
