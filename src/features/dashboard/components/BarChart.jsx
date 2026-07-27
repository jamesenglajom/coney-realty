"use client";

import { useState } from "react";

// Simple categorical column chart. Each bar's identity comes from the axis
// label directly beneath it, so no separate legend swatch is needed — color
// carries emphasis/branding, the label carries identity.
export default function BarChart({ data, height = 220, formatValue = (value) => value.toLocaleString() }) {
	const maxValue = Math.max(1, ...data.map((item) => item.value));
	const [hoveredIndex, setHoveredIndex] = useState(null);

	return (
		<div className="w-full">
			<div className="flex items-end gap-3" style={{ height }}>
				{data.map((item, index) => {
					const barHeightPct = Math.max((item.value / maxValue) * 100, item.value > 0 ? 2 : 0);
					const isHovered = hoveredIndex === index;

					return (
						<div
							key={item.label}
							className="relative flex h-full flex-1 flex-col items-center justify-end"
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							{isHovered ? (
								<div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-theme-blue px-2.5 py-1 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-theme-blue">
									{item.label}: {formatValue(item.value)}
								</div>
							) : null}
							<span className="mb-1.5 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark">
								{formatValue(item.value)}
							</span>
							<div
								className={`w-full max-w-6 rounded-t-[4px] transition-opacity ${item.colorClassName} ${
									isHovered ? "opacity-100" : "opacity-90"
								}`}
								style={{ height: `${barHeightPct}%` }}
							/>
						</div>
					);
				})}
			</div>
			<div className="mt-2 flex gap-3 border-t border-chart-axis pt-2 dark:border-chart-axis-dark">
				{data.map((item) => (
					<div
						key={item.label}
						className="flex-1 truncate text-center text-xs text-txt-muted dark:text-txt-muted-dark"
					>
						{item.label}
					</div>
				))}
			</div>
		</div>
	);
}
