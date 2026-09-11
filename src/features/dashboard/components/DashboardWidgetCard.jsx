import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";

// Shared chrome for a dashboard "shortcut" widget — an icon + title/subtitle
// header, a content slot (a short preview list, a mini chart, whatever's
// appropriate for that entity), and a footer link to the entity's own admin
// route. Each widget in DashboardWidgets.jsx only owns its content.
export default function DashboardWidgetCard({ icon: Icon, title, subtitle, href, linkLabel = "View all", children }) {
	return (
		<Card className="flex flex-col p-5">
			<div className="flex items-center gap-2.5">
				<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-theme-gold-light text-theme-blue dark:bg-white/5 dark:text-theme-gold">
					<Icon className="h-4.5 w-4.5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<h3 className="truncate text-[13.5px] font-bold text-theme-blue dark:text-white">{title}</h3>
					{subtitle ? (
						<p className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">{subtitle}</p>
					) : null}
				</div>
			</div>

			<div className="mt-4 flex-1">{children}</div>

			<Link
				href={href}
				className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-theme-gold-light py-2 text-xs font-semibold text-theme-blue transition-colors hover:border-theme-gold hover:bg-theme-gold-light dark:border-border-dark dark:text-theme-gold dark:hover:bg-white/5"
			>
				{linkLabel}
				<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
			</Link>
		</Card>
	);
}
