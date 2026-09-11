import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Sparkline from "./Sparkline";

const TONE_CLASSES = {
	blue: {
		icon: "bg-theme-gold-light text-theme-blue dark:bg-white/5 dark:text-theme-gold",
		stroke: "stroke-chart-1 dark:stroke-chart-1-dark",
		fill: "fill-chart-1 dark:fill-chart-1-dark",
	},
	green: {
		icon: "bg-success/10 text-success dark:bg-success-dark/15 dark:text-success-dark",
		stroke: "stroke-chart-3 dark:stroke-chart-3-dark",
		fill: "fill-chart-3 dark:fill-chart-3-dark",
	},
	gold: {
		icon: "bg-theme-gold/15 text-theme-blue dark:bg-theme-gold/10 dark:text-theme-gold",
		stroke: "stroke-chart-4 dark:stroke-chart-4-dark",
		fill: "fill-chart-4 dark:fill-chart-4-dark",
	},
	orange: {
		icon: "bg-warning/10 text-warning dark:bg-warning-dark/15 dark:text-warning-dark",
		stroke: "stroke-chart-2 dark:stroke-chart-2-dark",
		fill: "fill-chart-2 dark:fill-chart-2-dark",
	},
};

// Last two points of a cumulative monthly series -> a real (never invented)
// percent change plus the raw count behind it. previous === 0 means there's
// nothing to divide by (either brand new data or a genuinely quiet month
// before it) — reported as null rather than a fabricated/infinite percent.
function computeTrend(series) {
	if (!series || series.length < 2) return { pct: null, deltaCount: 0 };
	const current = series[series.length - 1].count;
	const previous = series[series.length - 2].count;
	const deltaCount = current - previous;
	if (previous === 0) return { pct: null, deltaCount };
	return { pct: (deltaCount / previous) * 100, deltaCount };
}

function TrendBadge({ pct }) {
	if (pct === null) return null;

	const isFlat = Math.abs(pct) < 0.05;
	const isUp = pct > 0;
	const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
	const toneClasses = isFlat
		? "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark"
		: isUp
			? "bg-success/15 text-success dark:bg-success-dark/20 dark:text-success-dark"
			: "bg-danger/15 text-danger dark:bg-danger-dark/20 dark:text-danger-dark";

	return (
		<span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold ${toneClasses}`}>
			<Icon className="h-3 w-3" aria-hidden="true" />
			{Math.abs(pct).toFixed(1)}%
		</span>
	);
}

// The "See Details" KPI card style — title + deep link, icon + big number +
// a real trend badge, and a sparkline paired with a plain-language caption.
// The sparkline is always a cumulative running total (see
// getAdminDashboardStats' toCumulative): this data set was bulk-imported in
// one or two months, so a raw "new this month" chart would mostly read as a
// single spike against flat zeros — cumulative totals are the same real
// numbers, just framed as an honest growth curve instead.
export default function KpiTrendCard({ label, value, sublabel, icon: Icon, tone = "blue", href, series, unit }) {
	const { pct, deltaCount } = computeTrend(series);
	const toneClasses = TONE_CLASSES[tone];

	const description =
		pct === null
			? deltaCount > 0
				? `${deltaCount} ${unit} added this month.`
				: `No new ${unit} yet this month.`
			: `${deltaCount >= 0 ? "+" : ""}${deltaCount} ${unit} vs last month.`;

	return (
		<Card className="p-5">
			<div className="flex items-center justify-between gap-2">
				<p className="text-[13px] font-semibold text-txt-secondary dark:text-txt-secondary-dark">{label}</p>
				<Button href={href} variant="ghost" size="sm" className="shrink-0">
					See Details
				</Button>
			</div>

			<div className="mt-4 flex items-center gap-3">
				<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses.icon}`}>
					<Icon className="h-4.5 w-4.5" aria-hidden="true" />
				</span>
				<span className="min-w-0">
					<span className="block text-[26px] font-extrabold leading-none tracking-tight text-theme-blue dark:text-white">
						{value}
					</span>
					{sublabel ? (
						<span className="mt-1 block text-[11px] text-txt-muted dark:text-txt-muted-dark">{sublabel}</span>
					) : null}
				</span>
				<TrendBadge pct={pct} />
			</div>

			<div className="mt-4 flex items-end gap-3">
				<div className="w-24 shrink-0">
					<Sparkline data={series} strokeClassName={toneClasses.stroke} fillClassName={toneClasses.fill} />
				</div>
				<p className="text-xs leading-snug text-txt-muted dark:text-txt-muted-dark">{description}</p>
			</div>
		</Card>
	);
}
