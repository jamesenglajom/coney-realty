"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changePasswordSchema } from "../schemas";
import { changeOwnPasswordAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

// Confirm-password is a client-only concern — the server action only needs
// currentPassword/newPassword, so this extension stays local to the form.
const formSchema = changePasswordSchema
	.extend({ confirmNewPassword: z.string().min(1, "Please confirm your new password") })
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ["confirmNewPassword"],
	});

export default function ChangePasswordForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
	});

	function onSubmit(values) {
		startTransition(async () => {
			const result = await changeOwnPasswordAction(values);

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Password changed.");
			reset();
			router.refresh();
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-sm space-y-4">
			<p className="text-sm text-txt-secondary dark:text-txt-secondary-dark">
				Lost access instead? Contact your administrator to have your password reset.
			</p>

			<div>
				<Label htmlFor="currentPassword">Current password</Label>
				<Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
				<FieldError>{errors.currentPassword?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="newPassword">New password</Label>
				<Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
				<FieldError>{errors.newPassword?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="confirmNewPassword">Confirm new password</Label>
				<Input
					id="confirmNewPassword"
					type="password"
					autoComplete="new-password"
					{...register("confirmNewPassword")}
				/>
				<FieldError>{errors.confirmNewPassword?.message}</FieldError>
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Change password"}
			</Button>
		</form>
	);
}
