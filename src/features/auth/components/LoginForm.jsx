"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "../schemas";
import { loginAction } from "../actions";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

export default function LoginForm() {
	const searchParams = useSearchParams();
	const next = searchParams.get("next");
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	function onSubmit(values) {
		setServerError("");
		startTransition(async () => {
			const result = await loginAction({ ...values, next });
			if (result?.error) {
				setServerError(result.error);
			}
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
			<div>
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" autoComplete="email" {...register("email")} />
				<FieldError>{errors.email?.message}</FieldError>
			</div>
			<div>
				<Label htmlFor="password">Password</Label>
				<Input id="password" type="password" autoComplete="current-password" {...register("password")} />
				<FieldError>{errors.password?.message}</FieldError>
			</div>
			{serverError ? <FieldError>{serverError}</FieldError> : null}
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Signing in…" : "Sign in"}
			</Button>
		</form>
	);
}
