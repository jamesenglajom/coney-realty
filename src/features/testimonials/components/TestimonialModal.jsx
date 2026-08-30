"use client";

import { useEffect, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { testimonialSchema } from "../schemas";
import { createTestimonialAction, updateTestimonialAction } from "../actions";
import { AGENT_SHOT_TYPES, AGENT_SHOT_LABELS } from "@/features/users/agentShots";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function TestimonialModal({ open, onClose, testimonial, agentOptions, agentPhotosById = {} }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
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

	const selectedAgentId = watch("agentId");
	const selectedPhotoUrl = watch("photoUrl");
	const agentPhotos = agentPhotosById[selectedAgentId];
	const availableShots = agentPhotos
		? AGENT_SHOT_TYPES.map((shot) => ({ shot, url: agentPhotos[shot] })).filter((option) => option.url)
		: [];

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

				{availableShots.length > 0 ? (
					<div>
						<Label>Pick a photo</Label>
						<div className="grid grid-cols-3 gap-2">
							{availableShots.map(({ shot, url }) => {
								const isSelected = selectedPhotoUrl === url;
								return (
									<button
										key={shot}
										type="button"
										onClick={() => setValue("photoUrl", url, { shouldValidate: true, shouldDirty: true })}
										className={`relative overflow-hidden rounded-lg ring-2 transition-colors ${
											isSelected ? "ring-theme-gold" : "ring-transparent hover:ring-theme-gray/40"
										}`}
									>
										<span className="relative block aspect-square w-full">
											<Image src={url} alt={AGENT_SHOT_LABELS[shot]} fill unoptimized className="object-cover" />
										</span>
										{isSelected ? (
											<span className="absolute right-1 top-1 rounded-full bg-theme-gold p-0.5 text-theme-blue">
												<Check className="h-3 w-3" aria-hidden="true" />
											</span>
										) : null}
										<span className="block truncate bg-black/60 px-1 py-0.5 text-[10px] text-white">
											{AGENT_SHOT_LABELS[shot]}
										</span>
									</button>
								);
							})}
						</div>
						<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
							From this agent&apos;s photo library (public/agents/). Click one to use it, or paste a different URL
							below.
						</p>
					</div>
				) : null}

				<div>
					<Label htmlFor="testimonialPhoto">Photo URL (optional)</Label>
					<Input
						id="testimonialPhoto"
						type="text"
						placeholder="https://… or /leaderboard/name.webp"
						{...register("photoUrl")}
					/>
					<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
						An allowed-host URL, or a file placed under <span className="font-mono">public/</span>. Falls back to the
						linked agent&apos;s photo library, then their avatar.
					</p>
					<FieldError>{errors.photoUrl?.message}</FieldError>
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
