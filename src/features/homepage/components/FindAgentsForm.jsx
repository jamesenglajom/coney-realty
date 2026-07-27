"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PRICE_BANDS } from "@/features/homepage/data";
import { PROPERTY_TYPES } from "@/features/properties/schemas";
import { getStoredVisitorEmail, setStoredVisitorEmail } from "@/features/homepage/visitorEmail";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FieldError from "@/components/ui/FieldError";
import Button from "@/components/ui/Button";

const FIELD_CLASSES =
	"w-full rounded-xl border border-white/20 bg-white/90 px-3.5 py-3 text-sm text-txt-primary outline-none focus:border-theme-gold dark:bg-white/10 dark:text-white";
const LABEL_CLASSES = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function FindAgentsForm({ cityStates, defaultLocation, defaultType, defaultPrice }) {
	const router = useRouter();
	const formRef = useRef(null);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [emailInput, setEmailInput] = useState("");
	const [emailError, setEmailError] = useState("");

	function navigateWithSearchParams() {
		const formData = new FormData(formRef.current);
		const params = new URLSearchParams();
		for (const [key, value] of formData.entries()) {
			if (value) params.set(key, String(value));
		}
		router.push(`/?${params.toString()}#search`);
	}

	function handleSubmit(event) {
		event.preventDefault();

		// Already have their email from an earlier search this browser — don't
		// ask again, just run the search.
		if (getStoredVisitorEmail()) {
			navigateWithSearchParams();
			return;
		}

		setIsEmailModalOpen(true);
	}

	function handleEmailSubmit(event) {
		event.preventDefault();

		const trimmed = emailInput.trim();
		if (!EMAIL_REGEX.test(trimmed)) {
			setEmailError("Enter a valid email address.");
			return;
		}

		setStoredVisitorEmail(trimmed);
		setIsEmailModalOpen(false);
		navigateWithSearchParams();
	}

	return (
		<>
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="grid gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
			>
				<div>
					<label htmlFor="loc" className={LABEL_CLASSES}>
						Location
					</label>
					<select id="loc" name="location" defaultValue={defaultLocation} className={FIELD_CLASSES}>
						<option value="">Anywhere</option>
						{cityStates.map((city) => (
							<option key={city} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="type" className={LABEL_CLASSES}>
						Property type
					</label>
					<select id="type" name="type" defaultValue={defaultType} className={FIELD_CLASSES}>
						<option value="">Any type</option>
						{PROPERTY_TYPES.map((propertyType) => (
							<option key={propertyType} value={propertyType}>
								{propertyType}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="price" className={LABEL_CLASSES}>
						Budget
					</label>
					<select id="price" name="price" defaultValue={defaultPrice} className={FIELD_CLASSES}>
						{PRICE_BANDS.map((band, index) => (
							<option key={band.label} value={index}>
								{band.label}
							</option>
						))}
					</select>
				</div>
				<button
					type="submit"
					className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-theme-gold px-6 text-sm font-semibold text-theme-blue transition-colors hover:brightness-105"
				>
					<Search className="h-4 w-4" aria-hidden="true" />
					Find agents
				</button>
			</form>

			<Modal open={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="One quick thing">
				<p className="mb-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
					Share your email so the agent you reach out to can follow up with you directly. We&apos;ll only ask once.
				</p>
				<form onSubmit={handleEmailSubmit} className="space-y-4">
					<div>
						<Label htmlFor="visitorEmail">Your email</Label>
						<Input
							id="visitorEmail"
							type="email"
							autoFocus
							placeholder="you@example.com"
							value={emailInput}
							onChange={(event) => {
								setEmailInput(event.target.value);
								setEmailError("");
							}}
						/>
						<FieldError>{emailError}</FieldError>
					</div>
					<Button type="submit" className="w-full">
						See matching agents
					</Button>
				</form>
			</Modal>
		</>
	);
}
