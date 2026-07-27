import { getPublicPropertyStats } from "@/features/homepage/queries";

const valueFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	notation: "compact",
	maximumFractionDigits: 1,
});

export default async function StatsBand() {
	const stats = await getPublicPropertyStats();

	const items = [
		{ value: `${stats.totalListings}+`, label: "Active listings" },
		{ value: valueFormatter.format(stats.totalValue), label: "Total listings value" },
		{ value: `${stats.totalAgents}`, label: "Local agents" },
		{ value: `${stats.districtsCovered}`, label: "Districts covered" },
	];

	return (
		<section
			aria-label="Company results"
			className="border-y border-theme-gray/15 bg-theme-blue text-white dark:border-white/10"
		>
			<div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
				{items.map((stat) => (
					<div key={stat.label}>
						<div className="font-display text-[clamp(34px,5vw,50px)] font-semibold text-theme-gold">
							{stat.value}
						</div>
						<div className="mt-1 text-sm text-white/70">{stat.label}</div>
					</div>
				))}
			</div>
		</section>
	);
}
