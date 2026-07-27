"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markPropertySoldAction } from "../actions";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

// Rendered by the parent independently of the row-actions dropdown, so
// closing that dropdown (which unmounts its menu) never destroys this modal
// mid-flow — its own `open` state lives one level up.
export default function MarkSoldModal({ open, onClose, propertyId, propertyTitle }) {
	const router = useRouter();
	const [soldDate, setSoldDate] = useState(todayIso());
	const [isPending, startTransition] = useTransition();

	function handleConfirm() {
		startTransition(async () => {
			const result = await markPropertySoldAction(propertyId, soldDate);
			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success(`"${propertyTitle}" marked as sold.`);
			onClose();
			router.refresh();
		});
	}

	return (
		<Modal open={open} onClose={onClose} title="Mark as sold">
			<p className="mb-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
				Mark &quot;{propertyTitle}&quot; as sold. When did the sale close?
			</p>
			<div className="mb-5">
				<Label htmlFor="soldDate">Sold date</Label>
				<Input
					id="soldDate"
					type="date"
					max={todayIso()}
					value={soldDate}
					onChange={(event) => setSoldDate(event.target.value)}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="button" onClick={handleConfirm} disabled={isPending}>
					{isPending ? "Saving…" : "Mark as sold"}
				</Button>
			</div>
		</Modal>
	);
}
