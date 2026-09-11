import Image from "next/image";
import { Building2, Trophy, Quote, CalendarCheck, ImageOff } from "lucide-react";
import DashboardWidgetCard from "./DashboardWidgetCard";
import { PROPERTY_STATUS_LABELS } from "@/features/properties/schemas";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	notation: "compact",
	maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });

const STATUS_DOT_CLASSES = {
	draft: "bg-chart-status-draft dark:bg-chart-status-draft-dark",
	published: "bg-chart-status-published dark:bg-chart-status-published-dark",
	on_hold: "bg-chart-status-onhold dark:bg-chart-status-onhold-dark",
	sold: "bg-chart-status-sold dark:bg-chart-status-sold-dark",
	archived: "bg-chart-status-archived dark:bg-chart-status-archived-dark",
};

const STATUS_PILL_CLASSES = {
	draft: "bg-chart-status-draft/15 text-chart-status-draft dark:bg-chart-status-draft-dark/20 dark:text-chart-status-draft-dark",
	published:
		"bg-chart-status-published/15 text-chart-status-published dark:bg-chart-status-published-dark/20 dark:text-chart-status-published-dark",
	on_hold:
		"bg-chart-status-onhold/15 text-chart-status-onhold dark:bg-chart-status-onhold-dark/20 dark:text-chart-status-onhold-dark",
	sold: "bg-chart-status-sold/20 text-chart-status-sold dark:bg-chart-status-sold-dark/20 dark:text-chart-status-sold-dark",
	archived:
		"bg-chart-status-archived/15 text-chart-status-archived dark:bg-chart-status-archived-dark/20 dark:text-chart-status-archived-dark",
};

const VIEWING_STATUS_PILL_CLASSES = {
	pending: "bg-warning/15 text-warning dark:bg-warning-dark/20 dark:text-warning-dark",
	confirmed: "bg-success/15 text-success dark:bg-success-dark/20 dark:text-success-dark",
	completed: "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark",
	cancelled: "bg-danger/15 text-danger dark:bg-danger-dark/20 dark:text-danger-dark",
};

// Recent listings — a segmented bar showing the same status mix the "Properties
// by status" chart plots below (so this widget doesn't duplicate that data,
// just previews it), plus the 3 newest listings.
export function PropertiesWidget({ properties, statusCounts, totalCount }) {
	const segments = Object.entries(statusCounts).filter(([, count]) => count > 0);

	return (
		<DashboardWidgetCard
			icon={Building2}
			title="Listings"
			subtitle={`${totalCount} total`}
			href="/admin/properties"
			linkLabel="View all properties"
		>
			{segments.length > 0 ? (
				<div className="mb-4 flex h-1.5 overflow-hidden rounded-full bg-theme-gold-light dark:bg-white/5">
					{segments.map(([status, count]) => (
						<span
							key={status}
							className={STATUS_DOT_CLASSES[status]}
							style={{ width: `${(count / totalCount) * 100}%` }}
							title={`${PROPERTY_STATUS_LABELS[status] ?? status}: ${count}`}
						/>
					))}
				</div>
			) : null}

			{properties.length === 0 ? (
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">No listings yet.</p>
			) : (
				<ul className="space-y-2.5">
					{properties.map((property) => (
						<li key={property.id} className="flex items-center gap-2.5">
							<div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-theme-gold-light dark:bg-white/5">
								{property.image_urls?.[0] ? (
									<Image src={property.image_urls[0]} alt="" fill sizes="36px" unoptimized className="object-cover" />
								) : (
									<span className="flex h-full w-full items-center justify-center text-txt-muted dark:text-txt-muted-dark">
										<ImageOff className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								)}
							</div>
							<p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-txt-primary dark:text-txt-primary-dark">
								{property.title}
							</p>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_PILL_CLASSES[property.status] ?? ""}`}
							>
								{PROPERTY_STATUS_LABELS[property.status] ?? property.status}
							</span>
						</li>
					))}
				</ul>
			)}
		</DashboardWidgetCard>
	);
}

// Top 3 ranked entries — a leaderboard is already a ranking, not a magnitude
// to chart, so the "appropriate visual" here is the ranked photo row itself
// (same rank-badge language as the homepage circles), not an invented bar.
export function LeaderboardWidget({ entries }) {
	const top3 = entries.slice(0, 3);

	return (
		<DashboardWidgetCard
			icon={Trophy}
			title="Leaderboard"
			subtitle={`${entries.length} agent${entries.length === 1 ? "" : "s"} ranked`}
			href="/admin/leaderboard"
			linkLabel="View leaderboard"
		>
			{top3.length === 0 ? (
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">No entries yet.</p>
			) : (
				<ul className="flex items-start justify-center gap-5 py-1.5">
					{top3.map((entry, index) => (
						<li key={entry.id} className="flex flex-col items-center gap-1.5">
							<div className="relative">
								<span className="relative block h-12 w-12 overflow-hidden rounded-full ring-2 ring-theme-gold/70">
									{entry.photoUrl ? (
										<Image src={entry.photoUrl} alt="" fill sizes="48px" unoptimized className="object-cover object-top" />
									) : (
										<span className="flex h-full w-full items-center justify-center bg-theme-gold-light text-sm font-bold text-theme-blue dark:bg-white/5 dark:text-theme-gold">
											{entry.name?.[0]?.toUpperCase() ?? "?"}
										</span>
									)}
								</span>
								<span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-theme-blue text-[10px] font-bold text-theme-gold ring-2 ring-white dark:ring-surface-dark">
									{index + 1}
								</span>
							</div>
							<p className="max-w-16 truncate text-center text-[11px] font-medium text-txt-secondary dark:text-txt-secondary-dark">
								{entry.name}
							</p>
						</li>
					))}
				</ul>
			)}
		</DashboardWidgetCard>
	);
}

// No natural magnitude to chart here either — the count is the whole story,
// so it's the big number, with the 2 newest quotes underneath.
export function TestimonialsWidget({ testimonials }) {
	const recent = testimonials.slice(0, 2);

	return (
		<DashboardWidgetCard
			icon={Quote}
			title="Testimonials"
			subtitle={`${testimonials.length} published`}
			href="/admin/testimonials"
			linkLabel="View testimonials"
		>
			{recent.length === 0 ? (
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">No testimonials yet.</p>
			) : (
				<ul className="space-y-3">
					{recent.map((testimonial) => (
						<li key={testimonial.id} className="border-l-2 border-theme-gold-light pl-3 dark:border-border-dark">
							<p className="line-clamp-2 text-[12.5px] italic leading-snug text-txt-secondary dark:text-txt-secondary-dark">
								&ldquo;{testimonial.quote}&rdquo;
							</p>
							<p className="mt-1 text-[11px] font-semibold text-txt-muted dark:text-txt-muted-dark">
								— {testimonial.clientName}
							</p>
						</li>
					))}
				</ul>
			)}
		</DashboardWidgetCard>
	);
}

// Status mix as small chips (pending/confirmed are the actionable ones, so
// they're called out) plus the 3 soonest-requested viewings.
export function ViewingsWidget({ requests }) {
	const upcoming = requests.filter((request) => request.status === "pending" || request.status === "confirmed").slice(0, 3);
	const pendingCount = requests.filter((request) => request.status === "pending").length;
	const confirmedCount = requests.filter((request) => request.status === "confirmed").length;

	return (
		<DashboardWidgetCard
			icon={CalendarCheck}
			title="Site viewings"
			subtitle={`${requests.length} total requests`}
			href="/admin/site-viewings"
			linkLabel="View site viewings"
		>
			<div className="mb-3.5 flex gap-2">
				<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${VIEWING_STATUS_PILL_CLASSES.pending}`}>
					{pendingCount} pending
				</span>
				<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${VIEWING_STATUS_PILL_CLASSES.confirmed}`}>
					{confirmedCount} confirmed
				</span>
			</div>

			{upcoming.length === 0 ? (
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">Nothing pending or confirmed.</p>
			) : (
				<ul className="space-y-2.5">
					{upcoming.map((request) => (
						<li key={request.id} className="flex items-center gap-2.5">
							<p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-txt-primary dark:text-txt-primary-dark">
								{request.visitor_name}
							</p>
							{request.preferred_date ? (
								<span className="shrink-0 text-[11px] text-txt-muted dark:text-txt-muted-dark">
									{dateFormatter.format(new Date(request.preferred_date))}
								</span>
							) : null}
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${VIEWING_STATUS_PILL_CLASSES[request.status] ?? ""}`}
							>
								{request.status}
							</span>
						</li>
					))}
				</ul>
			)}
		</DashboardWidgetCard>
	);
}
