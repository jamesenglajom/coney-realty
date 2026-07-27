import Link from "next/link";
import { Pencil } from "lucide-react";
import DeletePropertyButton from "./DeletePropertyButton";

const STATUS_BADGE_CLASSES = {
	draft: "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark",
	published: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
	sold: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	archived: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const priceFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

export default function PropertiesTable({ properties, canEdit, canDelete }) {
	const hasActionsColumn = canEdit || canDelete;

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
						{hasActionsColumn ? (
							<th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Actions
							</th>
						) : null}
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
					{properties.map((property) => (
						<tr key={property.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
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
							{hasActionsColumn ? (
								<td className="p-4 text-right">
									<div className="flex justify-end gap-2">
										{canEdit ? (
											<Link
												href={`/admin/properties/${property.id}/edit`}
												className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light dark:text-theme-gold dark:hover:bg-white/5"
											>
												<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
												Edit
											</Link>
										) : null}
										{canDelete ? (
											<DeletePropertyButton propertyId={property.id} propertyTitle={property.title} />
										) : null}
									</div>
								</td>
							) : null}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
