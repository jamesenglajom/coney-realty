import { PRICE_BANDS } from "@/features/homepage/data";

const METHOD_BADGE_CLASSES = {
	email: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	call: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

function formatDate(iso) {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function priceBandLabel(value) {
	if (!value) return null;
	return PRICE_BANDS[Number(value)]?.label ?? null;
}

export default function LeadsTable({ leads }) {
	if (leads.length === 0) {
		return (
			<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-[#333] dark:text-txt-muted-dark">
				No contact requests yet.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[720px] text-left border-collapse">
				<thead>
					<tr className="border-b border-theme-gold-light bg-[#fcfcfc] dark:border-[#333] dark:bg-black/40">
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Visitor
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Agent
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Method
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Search
						</th>
						<th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Date
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
					{leads.map((lead) => {
						const searchParts = [
							lead.search_location,
							lead.search_property_type,
							priceBandLabel(lead.search_price_band),
						].filter(Boolean);

						return (
							<tr key={lead.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02]">
								<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">{lead.visitor_email}</td>
								<td className="p-4 text-sm font-semibold text-theme-blue dark:text-white">
									{lead.agent?.full_name || lead.agent?.email || "—"}
								</td>
								<td className="p-4">
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${METHOD_BADGE_CLASSES[lead.contact_method]}`}
									>
										{lead.contact_method}
									</span>
								</td>
								<td className="p-4 text-sm text-txt-secondary dark:text-txt-secondary-dark">
									{searchParts.length > 0 ? searchParts.join(" · ") : "—"}
								</td>
								<td className="p-4 text-sm text-txt-muted dark:text-txt-muted-dark">{formatDate(lead.created_at)}</td>
							</tr>
						);
					})}
				</tbody>
				</table>
			</div>
		</div>
	);
}
