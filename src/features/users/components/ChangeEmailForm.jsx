"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeEmailSchema, computeDefaultPassword } from "../schemas";
import { changeOwnEmailAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function ChangeEmailForm({ currentEmail }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(changeEmailSchema),
		defaultValues: { newEmail: "" },
	});

	const newEmailValue = watch("newEmail");

	function onSubmit(values) {
		startTransition(async () => {
			const result = await changeOwnEmailAction(values);

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success(`Email updated. Your password also reset to: ${result.password}`, { duration: 20000 });
			router.refresh();
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-sm space-y-4">
			<div>
				<Label>Current email</Label>
				<p className="text-sm text-txt-secondary dark:text-txt-secondary-dark">{currentEmail}</p>
			</div>

			<div>
				<Label htmlFor="newEmail">New email</Label>
				<Input id="newEmail" type="email" autoComplete="off" {...register("newEmail")} />
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Your password will reset to match:{" "}
					<span className="font-mono">{newEmailValue ? computeDefaultPassword(newEmailValue) : "—"}</span>
				</p>
				<FieldError>{errors.newEmail?.message}</FieldError>
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Change email"}
			</Button>
		</form>
	);
}
