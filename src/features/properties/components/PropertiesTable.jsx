import Image from "next/image";
import { User } from "lucide-react";
import Badge from "@/components/ui/Badge";
import PropertyRowActions from "./PropertyRowActions";

const MAX_VISIBLE_AGENTS = 3;

function AgentAvatars({ agents }) {
	if (agents.length === 0) {
		return (
			<div
				title="Unassigned"
				className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-gray/10 text-txt-muted dark:bg-white/5 dark:text-txt-muted-dark"
			>
				<User className="h-4 w-4" aria-hidden="true" />
			</div>
		);
	}

	const visible = agents.slice(0, MAX_VISIBLE_AGENTS);
	const overflow = agents.slice(MAX_VISIBLE_AGENTS);

	return (
		<div className="flex -space-x-2">
			{visible.map((agent) => (
				<div
					key={agent.id}
					title={agent.name}
					className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-surface-dark"
				>
					{agent.avatarUrl ? (
						<Image src={agent.avatarUrl} alt={agent.name} fill sizes="32px" className="object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center bg-theme-gold text-xs font-bold text-theme-blue">
							{agent.name?.[0]?.toUpperCase() ?? "?"}
						</div>
					)}
				</div>
			))}
			{overflow.length > 0 ? (
				<div
					title={overflow.map((agent) => agent.name).join(", ")}
					className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-gray/20 text-[10px] font-semibold text-txt-secondary ring-2 ring-white dark:bg-white/10 dark:text-txt-secondary-dark dark:ring-surface-dark"
				>
					+{overflow.length}
				</div>
			) : null}
		</div>
	);
}

// Reuses the same chart-status-* tokens the dashboard's "Properties by
// status" chart draws from, so a status means the same color on this table
// as it does on the chart, not two independently-maintained palettes.
const STATUS_BADGE_CLASSES = {
	draft: "bg-chart-status-draft/15 text-chart-status-draft dark:bg-chart-status-draft-dark/20 dark:text-chart-status-draft-dark",
	published:
		"bg-chart-status-published/15 text-chart-status-published dark:bg-chart-status-published-dark/20 dark:text-chart-status-published-dark",
	sold: "bg-chart-status-sold/20 text-chart-status-sold dark:bg-chart-status-sold-dark/20 dark:text-chart-status-sold-dark",
	archived:
		"bg-chart-status-archived/15 text-chart-status-archived dark:bg-chart-status-archived-dark/20 dark:text-chart-status-archived-dark",
};

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

export default function PropertiesTable({ properties, canEdit, canDelete }) {
	if (properties.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
				No properties yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[960px] text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-border-dark dark:bg-black/40">
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Agent
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Title
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Type
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Status
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Payment
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Price
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Location
						</th>
						<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light dark:divide-border-dark">
					{properties.map((property) => (
						<tr key={property.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
							<td className="p-4">
								<AgentAvatars agents={property.assignedAgents ?? []} />
							</td>
							<td className="p-4">
								<div className="flex items-center gap-2">
									<p className="text-sm font-semibold text-theme-blue dark:text-white">{property.title}</p>
									{!property.hasImage ? (
										<Badge tone="warning" className="shrink-0">
											No image
										</Badge>
									) : null}
								</div>
								{property.screen_name ? (
									<p className="text-xs text-txt-secondary dark:text-txt-secondary-dark">{property.screen_name}</p>
								) : null}
								<p className="font-mono text-xs text-txt-muted dark:text-txt-muted-dark">{property.slug}</p>
							</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">{property.property_type}</td>
							<td className="p-4">
								<Badge className={`capitalize ${STATUS_BADGE_CLASSES[property.status]}`}>{property.status}</Badge>
							</td>
							<td className="p-4 text-sm capitalize text-txt-secondary dark:text-txt-secondary-dark">
								{property.payment_type || "—"}
							</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
								{property.price != null ? priceFormatter.format(property.price) : "—"}
							</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
								{property.city_state || [property.city, property.region, property.district].filter(Boolean).join(", ") || "—"}
							</td>
							<td className="p-4 text-right">
								<PropertyRowActions property={property} canEdit={canEdit} canDelete={canDelete} />
							</td>
						</tr>
					))}
				</tbody>
				</table>
			</div>
		</div>
	);
}
