"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildMonthGrid(year, month) {
	const firstWeekday = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const daysInPrevMonth = new Date(year, month, 0).getDate();

	const cells = [];
	for (let i = firstWeekday - 1; i >= 0; i -= 1) {
		cells.push({ day: daysInPrevMonth - i, inMonth: false });
	}
	for (let day = 1; day <= daysInMonth; day += 1) {
		cells.push({ day, inMonth: true });
	}
	let nextMonthDay = 1;
	while (cells.length % 7 !== 0) {
		cells.push({ day: nextMonthDay, inMonth: false });
		nextMonthDay += 1;
	}
	return cells;
}

// Small month-view calendar — pure client-side navigation, no data binding.
// Shown on every role's dashboard (Agent included) as a quick date
// reference, not tied to any particular admin permission.
export default function DashboardCalendar() {
	const today = new Date();
	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth());

	const cells = buildMonthGrid(viewYear, viewMonth);
	const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
	const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

	function goToMonth(delta) {
		const next = new Date(viewYear, viewMonth + delta, 1);
		setViewYear(next.getFullYear());
		setViewMonth(next.getMonth());
	}

	return (
		<Card className="p-5">
			<div className="flex items-center justify-between gap-2">
				<p className="truncate text-[13px] font-bold text-theme-blue dark:text-white">{monthLabel}</p>
				<div className="flex shrink-0 gap-1">
					<button
						type="button"
						onClick={() => goToMonth(-1)}
						aria-label="Previous month"
						className="rounded-lg p-1.5 text-txt-muted transition-colors hover:bg-theme-gold-light hover:text-theme-blue dark:text-txt-muted-dark dark:hover:bg-white/5 dark:hover:text-theme-gold"
					>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					</button>
					<button
						type="button"
						onClick={() => goToMonth(1)}
						aria-label="Next month"
						className="rounded-lg p-1.5 text-txt-muted transition-colors hover:bg-theme-gold-light hover:text-theme-blue dark:text-txt-muted-dark dark:hover:bg-white/5 dark:hover:text-theme-gold"
					>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
				{WEEKDAY_LABELS.map((label) => (
					<span
						key={label}
						className="text-[10px] font-bold uppercase tracking-wide text-txt-muted dark:text-txt-muted-dark"
					>
						{label}
					</span>
				))}
				{cells.map((cell, index) => {
					const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate();
					return (
						<span
							key={index}
							className={`mx-auto flex aspect-square w-full max-w-8 items-center justify-center rounded-full text-[12.5px] ${
								isToday
									? "bg-theme-blue font-bold text-white dark:bg-theme-gold dark:text-theme-blue"
									: cell.inMonth
										? "font-medium text-txt-primary dark:text-txt-primary-dark"
										: "text-txt-muted/35 dark:text-txt-muted-dark/35"
							}`}
						>
							{cell.day}
						</span>
					);
				})}
			</div>
		</Card>
	);
}
