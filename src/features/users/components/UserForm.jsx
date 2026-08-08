"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUserSchema, updateUserSchema, computeDefaultPassword } from "../schemas";
import { createUserAction, updateUserAction, checkEmailAvailabilityAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function UserForm({ mode, user, assignableRoles }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");
	const isEdit = mode === "edit";

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
		defaultValues: isEdit
			? {
					id: user.id,
					fullName: user.full_name,
					role: user.role,
					phone: user.phone ?? "",
					bio: user.bio ?? "",
					avatarUrl: user.avatarUrl ?? "",
				}
			: { email: "", fullName: "", role: "Agent", phone: "", bio: "", avatarUrl: "" },
	});

	const emailValue = watch("email");
	const [duplicate, setDuplicate] = useState(null);

	// Live duplicate-check as the admin types, so they find out before
	// submitting rather than from a failed insert afterward.
	useEffect(() => {
		if (isEdit) return undefined;
		if (!emailValue || !/^\S+@\S+\.\S+$/.test(emailValue)) {
			setDuplicate(null);
			return undefined;
		}

		let cancelled = false;
		const timeout = setTimeout(async () => {
			const result = await checkEmailAvailabilityAction(emailValue);
			if (!cancelled) setDuplicate(result.exists ? result : null);
		}, 400);

		return () => {
			cancelled = true;
			clearTimeout(timeout);
		};
	}, [emailValue, isEdit]);

	function onSubmit(values) {
		if (duplicate) {
			setServerError(`A user with this email already exists: ${duplicate.name} (${duplicate.role}).`);
			return;
		}

		setServerError("");
		startTransition(async () => {
			const action = isEdit ? updateUserAction : createUserAction;
			const result = await action(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			if (!isEdit && result?.password) {
				toast.success(`User created. Default password: ${result.password}`, { duration: 15000 });
			} else {
				toast.success("User updated.");
			}
			router.push("/admin/users");
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
			{isEdit ? <input type="hidden" {...register("id")} /> : null}

			{!isEdit ? (
				<div>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" autoComplete="off" {...register("email")} />
					<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
						Default password will be:{" "}
						<span className="font-mono">{emailValue ? computeDefaultPassword(emailValue) : "—"}</span>
					</p>
					{duplicate ? (
						<p className="mt-1.5 text-xs font-medium text-danger dark:text-danger-dark">
							A user with this email already exists: {duplicate.name} ({duplicate.role})
							{duplicate.removed ? " — removed" : ""}.
						</p>
					) : null}
					<FieldError>{errors.email?.message}</FieldError>
				</div>
			) : null}

			<div>
				<Label htmlFor="fullName">Full name</Label>
				<Input id="fullName" type="text" autoComplete="off" {...register("fullName")} />
				<FieldError>{errors.fullName?.message}</FieldError>
			</div>

			<div>
				<Label htmlFor="role">Role</Label>
				<Select id="role" {...register("role")}>
					{assignableRoles.map((role) => (
						<option key={role} value={role}>
							{role}
						</option>
					))}
				</Select>
				<FieldError>{errors.role?.message}</FieldError>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="phone">Phone (public)</Label>
					<Input id="phone" type="tel" placeholder="+63 912 345 6789" {...register("phone")} />
					<FieldError>{errors.phone?.message}</FieldError>
				</div>
				<div>
					<Label htmlFor="avatarUrl">Avatar URL</Label>
					<Input id="avatarUrl" type="text" placeholder="https://…" {...register("avatarUrl")} />
					<FieldError>{errors.avatarUrl?.message}</FieldError>
				</div>
			</div>

			<div>
				<Label htmlFor="bio">Bio (public)</Label>
				<Textarea id="bio" rows={4} {...register("bio")} />
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown on this agent&apos;s public profile page.
				</p>
				<FieldError>{errors.bio?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending || Boolean(duplicate)}>
					{isPending ? "Saving…" : isEdit ? "Save changes" : "Create user"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/users")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
