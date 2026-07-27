"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUserSchema, updateUserSchema } from "../schemas";
import { createUserAction, updateUserAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
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
			: { email: "", fullName: "", role: "Agent", password: "", phone: "", bio: "", avatarUrl: "" },
	});

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const action = isEdit ? updateUserAction : createUserAction;
			const result = await action(values);

			if (result?.error) {
				setServerError(result.error);
				return;
			}

			toast.success(isEdit ? "User updated." : "User created.");
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

			{!isEdit ? (
				<div>
					<Label htmlFor="password">Temporary password</Label>
					<Input id="password" type="text" autoComplete="off" {...register("password")} />
					<FieldError>{errors.password?.message}</FieldError>
				</div>
			) : null}

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
				<textarea
					id="bio"
					rows={4}
					{...register("bio")}
					className="w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold"
				/>
				<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
					Shown on this agent&apos;s public profile page.
				</p>
				<FieldError>{errors.bio?.message}</FieldError>
			</div>

			{serverError ? <FieldError>{serverError}</FieldError> : null}

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : isEdit ? "Save changes" : "Create user"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/users")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
