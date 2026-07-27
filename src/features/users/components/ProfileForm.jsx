"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { toast } from "sonner";
import { updateOwnProfileSchema } from "../schemas";
import { updateOwnProfileAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

function isHttpUrl(value) {
	return /^https?:\/\//.test(value ?? "");
}

export default function ProfileForm({ user }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(updateOwnProfileSchema),
		defaultValues: {
			fullName: user.full_name,
			phone: user.phone ?? "",
			bio: user.bio ?? "",
			avatarUrl: user.avatarUrl ?? "",
		},
	});

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const result = await updateOwnProfileAction(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			toast.success("Profile updated.");
			router.refresh();
		});
	}

	const avatarUrlValue = watch("avatarUrl");
	const showAvatarPreview = isHttpUrl(avatarUrlValue) && !avatarLoadFailed;

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
			<p className="text-sm text-txt-secondary dark:text-txt-secondary-dark">
				To change your login email, use the Change email tab.
			</p>

			<div>
				<Label htmlFor="fullName">Full name</Label>
				<Input id="fullName" type="text" autoComplete="off" {...register("fullName")} />
				<FieldError>{errors.fullName?.message}</FieldError>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="phone">Phone (public)</Label>
					<Input id="phone" type="tel" placeholder="+63 912 345 6789" {...register("phone")} />
					<FieldError>{errors.phone?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="avatarUrl">Avatar URL</Label>
					<div className="flex items-center gap-3">
						<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-theme-gray/10 dark:bg-white/5">
							{showAvatarPreview ? (
								<Image
									src={avatarUrlValue}
									alt=""
									fill
									unoptimized
									sizes="44px"
									className="object-cover"
									onError={() => setAvatarLoadFailed(true)}
									onLoad={() => setAvatarLoadFailed(false)}
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-txt-muted dark:text-txt-muted-dark">
									<User className="h-5 w-5" aria-hidden="true" />
								</div>
							)}
						</div>
						<Input
							id="avatarUrl"
							type="text"
							placeholder="https://…"
							{...register("avatarUrl", { onChange: () => setAvatarLoadFailed(false) })}
						/>
					</div>
					{avatarLoadFailed ? (
						<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
							Couldn&apos;t load an image from that URL.
						</p>
					) : null}
					<FieldError>{errors.avatarUrl?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="bio">Bio (public)</Label>
				<textarea
					id="bio"
					rows={4}
					{...register("bio")}
					className="w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold"
				/>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown on your public agent profile page.
				</p>
				<FieldError>{errors.bio?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
