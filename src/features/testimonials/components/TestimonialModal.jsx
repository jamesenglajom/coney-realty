"use client";

import { useEffect, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { testimonialSchema } from "../schemas";
import { createTestimonialAction, updateTestimonialAction } from "../actions";
import CopyButton from "@/components/ui/CopyButton";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function TestimonialModal({ open, onClose, testimonial, agentOptions }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const isEdit = Boolean(testimonial);
	const filenameKey = testimonial?.slug || testimonial?.id;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(testimonialSchema),
		defaultValues: { quote: "", clientName: "", agentDisplayName: "", agentTagline: "", slug: "", agentId: "" },
	});

	useEffect(() => {
		if (!open) return;
		reset({
			quote: testimonial?.quote ?? "",
			clientName: testimonial?.clientName ?? "",
			agentDisplayName: testimonial?.agentDisplayName ?? "",
			agentTagline: testimonial?.agentTagline ?? "",
			slug: testimonial?.slug ?? "",
			agentId: testimonial?.agentId ?? "",
		});
	}, [open, testimonial, reset]);

	function onSubmit(values) {
		startTransition(async () => {
			const result = isEdit
				? await updateTestimonialAction(testimonial.id, values)
				: await createTestimonialAction(values);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success(isEdit ? "Testimonial updated." : "Testimonial added.");
			onClose();
			router.refresh();
		});
	}

	return (
		<Modal open={open} onClose={onClose} title={isEdit ? "Edit testimonial" : "Add testimonial"}>
			<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
				{isEdit ? (
					<div className="flex items-center gap-3 rounded-xl border border-theme-gold-light bg-theme-gold-light/40 p-3 dark:border-border-dark dark:bg-white/5">
						<span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-theme-gray/10 dark:bg-white/5">
							<Image src={testimonial.photo} alt="" fill sizes="48px" unoptimized className="object-cover" />
						</span>
						<div className="min-w-0 text-xs text-txt-secondary dark:text-txt-secondary-dark">
							<p>
								To set this testimonial&apos;s own photo, save an image as{" "}
								<span className="font-mono">public/testimonials/{filenameKey}.webp</span> (jpg/png also work).
							</p>
							<div className="mt-1 flex items-center gap-1">
								<span className="truncate font-mono text-[11px] text-txt-muted dark:text-txt-muted-dark">
									{filenameKey}
								</span>
								<CopyButton value={filenameKey} label="Image filename key" />
							</div>
						</div>
					</div>
				) : null}

				<div>
					<Label htmlFor="testimonialQuote">Quote</Label>
					<Textarea
						id="testimonialQuote"
						rows={4}
						placeholder="Sobrang thankful ako kay…"
						{...register("quote")}
					/>
					<FieldError>{errors.quote?.message}</FieldError>
				</div>

				<div>
					<Label htmlFor="testimonialClient">Client name</Label>
					<Input id="testimonialClient" type="text" placeholder="Imelia S." {...register("clientName")} />
					<FieldError>{errors.clientName?.message}</FieldError>
				</div>

				<div>
					<Label htmlFor="testimonialAgent">Link to agent (optional)</Label>
					<Select id="testimonialAgent" {...register("agentId")}>
						<option value="">Not linked</option>
						{agentOptions.map((agent) => (
							<option key={agent.id} value={agent.id}>
								{agent.name}
							</option>
						))}
					</Select>
					<FieldError>{errors.agentId?.message}</FieldError>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<Label htmlFor="testimonialAgentName">Agent display name</Label>
						<Input id="testimonialAgentName" type="text" placeholder="Jayson" {...register("agentDisplayName")} />
						<FieldError>{errors.agentDisplayName?.message}</FieldError>
					</div>
					<div>
						<Label htmlFor="testimonialAgentTagline">Agent tagline (optional)</Label>
						<Input
							id="testimonialAgentTagline"
							type="text"
							placeholder="Your Real Estate Partner"
							{...register("agentTagline")}
						/>
						<FieldError>{errors.agentTagline?.message}</FieldError>
					</div>
				</div>

				<div>
					<Label htmlFor="testimonialSlug">Photo filename key (optional)</Label>
					<Input id="testimonialSlug" type="text" placeholder="imelia-s" {...register("slug")} />
					<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
						Lowercase, hyphenated — used to name the photo file (
						<span className="font-mono">public/testimonials/{"{this}"}.webp</span>). Leave blank to use the
						testimonial&apos;s ID instead once it&apos;s saved.
					</p>
					<FieldError>{errors.slug?.message}</FieldError>
				</div>

				<div className="flex justify-end gap-2 pt-1">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving…" : isEdit ? "Save changes" : "Add testimonial"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
