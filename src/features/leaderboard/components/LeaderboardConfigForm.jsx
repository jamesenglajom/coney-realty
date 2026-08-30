"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { leaderboardConfigSchema } from "../schemas";
import { updateLeaderboardConfigAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function LeaderboardConfigForm({ config }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(leaderboardConfigSchema),
		defaultValues: {
			heading: config?.heading ?? "Top Producers",
			periodLabel: config?.periodLabel ?? "",
			isPublished: Boolean(config?.isPublished),
			showRanks6To10: config?.showRanks6To10 ?? true,
		},
	});

	function onSubmit(values) {
		startTransition(async () => {
			const result = await updateLeaderboardConfigAction(values);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Leaderboard settings saved.");
			router.refresh();
		});
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className="max-w-lg space-y-4 rounded-xl border border-theme-gold-light p-5 dark:border-border-dark"
		>
			<div>
				<Label htmlFor="heading">Heading</Label>
				<Input id="heading" type="text" placeholder="Top Producers" {...register("heading")} />
				<FieldError>{errors.heading?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="periodLabel">Period label</Label>
				<Input id="periodLabel" type="text" placeholder="e.g. July 2026" {...register("periodLabel")} />
				<FieldError>{errors.periodLabel?.message}</FieldError>
			</div>

			<label className="flex items-center gap-2 text-sm text-txt-secondary dark:text-txt-secondary-dark">
				<input type="checkbox" className="h-4 w-4 accent-theme-gold" {...register("isPublished")} />
				Show this leaderboard on the homepage
			</label>

			<label className="flex items-center gap-2 text-sm text-txt-secondary dark:text-txt-secondary-dark">
				<input type="checkbox" className="h-4 w-4 accent-theme-gold" {...register("showRanks6To10")} />
				Show ranks 6–10 (the circle avatars below the top 5)
			</label>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Save settings"}
			</Button>
		</form>
	);
}
