"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Hash } from "lucide-react";
import { lookupPropertyByCodeAction } from "../actions";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

// Secondary, low-emphasis entry point to a niche feature (most visitors
// browse, they don't have a code memorized) — a small text trigger under the
// main search form rather than a field competing with location/type/budget
// for attention, per the "minimize this" ask it was built for.
export default function CodeSearchModal() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	function close() {
		setOpen(false);
		setCode("");
		setError("");
	}

	function onSubmit(event) {
		event.preventDefault();
		setError("");

		startTransition(async () => {
			const result = await lookupPropertyByCodeAction(code);
			if (result?.error) {
				setError(result.error);
				return;
			}
			router.push(`/property/${result.slug}`);
		});
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
			>
				<Hash className="h-3.5 w-3.5" aria-hidden="true" />
				Have a property code? Skip straight to the listing
			</button>

			<Modal open={open} onClose={close} title="Search by property code">
				<form onSubmit={onSubmit} className="space-y-4">
					<p className="text-sm text-txt-secondary dark:text-txt-secondary-dark">
						Enter the reference code your agent gave you to jump straight to that listing.
					</p>
					<div>
						<Label htmlFor="propertyCode">Property code</Label>
						<Input
							id="propertyCode"
							type="text"
							autoFocus
							placeholder="e.g. DVO-2024-001"
							value={code}
							onChange={(event) => setCode(event.target.value)}
						/>
						{error ? <p className="mt-1.5 text-xs font-medium text-danger dark:text-danger-dark">{error}</p> : null}
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Searching…" : "Go to listing"}
						</Button>
						<Button type="button" variant="ghost" onClick={close}>
							Cancel
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}
