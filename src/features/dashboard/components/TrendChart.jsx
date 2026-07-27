"use client";

import { useState } from "react";

// Single-series line + area trend. One hue (sequential default), so no
// legend — the chart title already names what's plotted.
export default function TrendChart({ data, height = 220, formatValue = (value) => value.toLocaleString() }) {
	const maxValue = Math.max(1, ...data.map((item) => item.value));
	const [hoveredIndex, setHoveredIndex] = useState(null);

	const points = data.map((item, index) => ({
		...item,
		x: data.length === 1 ? 50 : (index / (data.length - 1)) * 100,
		y: 100 - (item.value / maxValue) * 85,
	}));

	const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
	const areaPath = `${linePath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

	return (
		<div className="w-full">
			<div className="relative" style={{ height }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
					{[0, 25, 50, 75, 100].map((gridY) => (
						<line
							key={gridY}
							x1="0"
							x2="100"
							y1={gridY}
							y2={gridY}
							className="stroke-chart-grid dark:stroke-chart-grid-dark"
							strokeWidth="1"
							vectorEffect="non-scaling-stroke"
						/>
					))}
					<path d={areaPath} className="fill-chart-1 dark:fill-chart-1-dark" opacity="0.1" stroke="none" />
					<path
						d={linePath}
						fill="none"
						className="stroke-chart-1 dark:stroke-chart-1-dark"
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
						strokeLinejoin="round"
						strokeLinecap="round"
					/>
					{points.map((point, index) => (
						<circle
							key={point.label}
							cx={point.x}
							cy={point.y}
							r={hoveredIndex === index ? 5 : 4}
							className="fill-chart-1 stroke-white dark:fill-chart-1-dark dark:stroke-[#1a1a1a]"
							strokeWidth="2"
							vectorEffect="non-scaling-stroke"
							style={{ cursor: "pointer" }}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						/>
					))}
				</svg>

				{hoveredIndex !== null ? (
					<div
						className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-theme-blue px-2.5 py-1 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-theme-blue"
						style={{ left: `${points[hoveredIndex].x}%`, top: `${points[hoveredIndex].y}%`, marginTop: -10 }}
					>
						{points[hoveredIndex].label}: {formatValue(points[hoveredIndex].value)}
					</div>
				) : null}
			</div>
			<div className="mt-2 flex justify-between border-t border-chart-axis pt-2 dark:border-chart-axis-dark">
				{data.map((item) => (
					<span key={item.label} className="text-xs text-txt-muted dark:text-txt-muted-dark">
						{item.label}
					</span>
				))}
			</div>
		</div>
	);
}
