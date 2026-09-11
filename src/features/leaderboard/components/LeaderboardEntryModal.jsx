"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { leaderboardEntrySchema } from "../schemas";
import { createLeaderboardEntryAction, updateLeaderboardEntryAction } from "../actions";
import MediaPickerModal from "@/features/media/components/MediaPickerModal";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function LeaderboardEntryModal({ open, onClose, entry, agentOptions }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [pickerOpen, setPickerOpen] = useState(false);
	const isEdit = Boolean(entry);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(leaderboardEntrySchema),
		defaultValues: { name: "", title: "", photoUrl: "", agentId: "" },
	});

	const photoUrl = watch("photoUrl");

	useEffect(() => {
		if (!open) return;
		reset({
			name: entry?.name ?? "",
			title: entry?.title ?? "",
			photoUrl: entry?.photoUrl ?? "",
			agentId: entry?.agentId ?? "",
		});
	}, [open, entry, reset]);

	function onSubmit(values) {
		startTransition(async () => {
			const result = isEdit
				? await updateLeaderboardEntryAction(entry.id, values)
				: await createLeaderboardEntryAction(values);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success(isEdit ? "Producer updated." : "Producer added.");
			onClose();
			router.refresh();
		});
	}

	return (
		<Modal open={open} onClose={onClose} title={isEdit ? "Edit producer" : "Add producer"}>
			<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
				<div>
					<Label htmlFor="entryName">Name</Label>
					<Input id="entryName" type="text" placeholder="KLEIN M." {...register("name")} />
					<FieldError>{errors.name?.message}</FieldError>
				</div>

				<div>
					<Label htmlFor="entryTitle">Title (optional)</Label>
					<Input id="entryTitle" type="text" placeholder="e.g. Senior Broker" {...register("title")} />
					<FieldError>{errors.title?.message}</FieldError>
				</div>

				<div>
					<Label htmlFor="entryAgent">Link to agent (optional)</Label>
					<Select id="entryAgent" {...register("agentId")}>
						<option value="">Not linked</option>
						{agentOptions.map((agent) => (
							<option key={agent.id} value={agent.id}>
								{agent.name}
							</option>
						))}
					</Select>
					<FieldError>{errors.agentId?.message}</FieldError>
				</div>

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
						Browse both headshot and half-body shots to pick whichever looks better here. Falls back to a rank
						photo, then the linked agent&apos;s avatar, if left blank.
					</p>
					<FieldError>{errors.photoUrl?.message}</FieldError>
				</div>

				<div className="flex justify-end gap-2 pt-1">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving…" : isEdit ? "Save changes" : "Add producer"}
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
