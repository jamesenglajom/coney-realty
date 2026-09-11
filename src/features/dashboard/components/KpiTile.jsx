import Card from "@/components/ui/Card";

// Shared dashboard stat tile — previously duplicated as a file-private
// component in AdminDashboard.jsx and hand-copied 4x inline in the Agent
// dashboard (admin/page.jsx) since there was nothing shared to import.
// `icon`/`tone` are optional (a lucide component + a small palette key) —
// callers that don't pass them get the original plain label/value/sublabel
// layout unchanged.
const ICON_TONE_CLASSES = {
	blue: "bg-theme-gold-light text-theme-blue dark:bg-white/5 dark:text-theme-gold",
	gold: "bg-theme-gold/15 text-theme-blue dark:bg-theme-gold/10 dark:text-theme-gold",
	success: "bg-success/10 text-success dark:bg-success-dark/15 dark:text-success-dark",
	warning: "bg-warning/10 text-warning dark:bg-warning-dark/15 dark:text-warning-dark",
};

export default function KpiTile({ label, value, sublabel, icon: Icon, tone = "blue" }) {
	return (
		<Card className="p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[13px] font-medium text-txt-secondary dark:text-txt-secondary-dark">{label}</p>
					<h3 className="mt-2 text-[26px] font-extrabold leading-none tracking-tight text-theme-blue dark:text-white">
						{value}
					</h3>
					{sublabel ? <p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">{sublabel}</p> : null}
				</div>
				{Icon ? (
					<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_TONE_CLASSES[tone]}`}>
						<Icon className="h-4.5 w-4.5" aria-hidden="true" />
					</span>
				) : null}
			</div>
		</Card>
	);
}
