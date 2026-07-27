import Image from "next/image";
import { User } from "lucide-react";
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
					className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-[#1a1a1a]"
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
					className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-gray/20 text-[10px] font-semibold text-txt-secondary ring-2 ring-white dark:bg-white/10 dark:text-txt-secondary-dark dark:ring-[#1a1a1a]"
				>
					+{overflow.length}
				</div>
			) : null}
		</div>
	);
}

const STATUS_BADGE_CLASSES = {
	draft: "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark",
	published: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
	sold: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	archived: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

export default function PropertiesTable({ properties, canEdit, canDelete }) {
	if (properties.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-[#333] dark:text-txt-muted-dark">
				No properties yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-[#333] dark:bg-black/40">
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
				<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
					{properties.map((property) => (
						<tr key={property.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
							<td className="p-4">
								<AgentAvatars agents={property.assignedAgents ?? []} />
							</td>
							<td className="p-4 text-sm font-semibold text-theme-blue dark:text-white">{property.title}</td>
							<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">{property.property_type}</td>
							<td className="p-4">
								<span
									className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE_CLASSES[property.status]}`}
								>
									{property.status}
								</span>
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
	);
}
