"use client";

import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const STORAGE_KEY = "admin:leaderboard-walkthrough-dismissed";

const STEPS = [
	{
		title: "Add your producers",
		description: 'Use "Add producer" to add each person’s name, an optional title, and a photo.',
	},
	{
		title: "Drag to reorder",
		description:
			"Grab the handle on the left of a row and drop it where you want. Ranks 1–5 show as the big cards, 6–10 as circle avatars — order here is exactly what the homepage shows.",
	},
	{
		title: "Set the heading & period",
		description:
			'Use the panel above the list to set the board’s heading (e.g. "Top Producers") and period label (e.g. "July 2026").',
	},
	{
		title: "Publish when ready",
		description:
			'Flip "Show this leaderboard on the homepage" on to go live. Turn it off anytime to hide the section without losing your list.',
	},
];

export default function LeaderboardWalkthrough() {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(0);

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY) !== "true") setOpen(true);
	}, []);

	function dismiss() {
		localStorage.setItem(STORAGE_KEY, "true");
		setOpen(false);
		setStep(0);
	}

	function reopen() {
		setStep(0);
		setOpen(true);
	}

	const isLastStep = step === STEPS.length - 1;
	const current = STEPS[step];

	return (
		<>
			<Button type="button" variant="ghost" size="sm" onClick={reopen}>
				<CircleHelp className="h-4 w-4" aria-hidden="true" />
				How this works
			</Button>

			<Modal open={open} onClose={dismiss} title={`${step + 1}. ${current.title}`}>
				<p className="text-sm text-txt-secondary dark:text-txt-secondary-dark">{current.description}</p>

				<div className="mt-6 flex items-center justify-between">
					<div className="flex gap-1.5" aria-hidden="true">
						{STEPS.map((s, index) => (
							<span
								key={s.title}
								className={`h-1.5 w-5 rounded-full transition-colors ${
									index === step ? "bg-theme-gold" : "bg-theme-gray/25 dark:bg-white/15"
								}`}
							/>
						))}
					</div>

					<div className="flex gap-2">
						{step > 0 ? (
							<Button type="button" variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
								Back
							</Button>
						) : (
							<Button type="button" variant="ghost" size="sm" onClick={dismiss}>
								Skip
							</Button>
						)}
						<Button type="button" size="sm" onClick={() => (isLastStep ? dismiss() : setStep((s) => s + 1))}>
							{isLastStep ? "Got it" : "Next"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
