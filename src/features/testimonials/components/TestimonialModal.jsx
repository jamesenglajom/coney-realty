"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { testimonialSchema } from "../schemas";
import { createTestimonialAction, updateTestimonialAction } from "../actions";
import MediaPickerModal from "@/features/media/components/MediaPickerModal";
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
	const [pickerOpen, setPickerOpen] = useState(false);
	const isEdit = Boolean(testimonial);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(testimonialSchema),
		defaultValues: { quote: "", clientName: "", agentDisplayName: "", agentTagline: "", photoUrl: "", agentId: "" },
	});

	useEffect(() => {
		if (!open) return;
		reset({
			quote: testimonial?.quote ?? "",
			clientName: testimonial?.clientName ?? "",
			agentDisplayName: testimonial?.agentDisplayName ?? "",
			agentTagline: testimonial?.agentTagline ?? "",
			photoUrl: testimonial?.photoUrl ?? "",
			agentId: testimonial?.agentId ?? "",
		});
	}, [open, testimonial, reset]);

	const photoUrl = watch("photoUrl");

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
				<div>
					<Label>Photo</Label>
					<div className="flex items-center gap-3">
						<span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-theme-gray/10 dark:bg-white/5">
							{photoUrl ? (
								<Image src={photoUrl} alt="" fill sizes="56px" unoptimized className="object-cover" />
							) : null}
						</span>
						<Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
							<ImagePlus className="h-4 w-4" aria-hidden="true" />
							{photoUrl ? "Change photo" : "Choose photo"}
						</Button>
						{photoUrl ? (
							<button
								type="button"
								onClick={() => setValue("photoUrl", "", { shouldDirty: true })}
								className="text-xs text-txt-muted hover:text-danger dark:text-txt-muted-dark"
							>
								Remove
							</button>
						) : null}
					</div>
					<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
						Picked from the agent-half-body media library. Leave blank to fall back to the linked agent&apos;s
						account avatar.
					</p>
				</div>

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

				<div className="flex justify-end gap-2 pt-1">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving…" : isEdit ? "Save changes" : "Add testimonial"}
					</Button>
				</div>
			</form>

			<MediaPickerModal
				open={pickerOpen}
				onClose={() => setPickerOpen(false)}
				folders={["agent-half-body"]}
				onSelect={([url]) => setValue("photoUrl", url, { shouldValidate: true, shouldDirty: true })}
			/>
		</Modal>
	);
}
