import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listPublicProperties, listPublishedCityStates, PUBLIC_PROPERTIES_PAGE_SIZE } from "@/features/homepage/queries";
import SectionHeading from "@/features/homepage/components/ui/SectionHeading";
import PublicPropertiesFilterBar from "@/features/homepage/components/PublicPropertiesFilterBar";
import PropertyCard from "@/features/homepage/components/PropertyCard";

export const metadata = {
	title: "Properties",
	description: "Browse current listings from ConeyRealty agents — filter by location, type, and budget.",
};

function pageHref(params, page) {
	const next = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value) next.set(key, String(value));
	}
	if (page > 1) next.set("page", String(page));
	const qs = next.toString();
	return qs ? `/properties?${qs}` : "/properties";
}

export default async function PublicPropertiesPage({ searchParams }) {
	const params = await searchParams;
	const city = params.city || undefined;
	const propertyType = params.propertyType || undefined;
	const price = params.price || undefined;
	const page = Number(params.page) || 1;

	const [{ properties, total }, cities] = await Promise.all([
		listPublicProperties({ city, propertyType, price, page }),
		listPublishedCityStates(),
	]);

	const totalPages = Math.max(1, Math.ceil(total / PUBLIC_PROPERTIES_PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const filterParams = { city, propertyType, price };

	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<SectionHeading
					eyebrow="Listings"
					title="Every current property, in one place"
					description="Filter by where you're looking, what kind of home, and your budget — every card links straight to the listing agent."
				/>

				<div className="mt-10">
					<PublicPropertiesFilterBar cities={cities} city={city} propertyType={propertyType} price={price} />
				</div>

				{properties.length === 0 ? (
					<p className="mt-16 text-center text-sm text-txt-muted dark:text-txt-muted-dark">
						No properties match those filters right now — try widening your search.
					</p>
				) : (
					<>
						<ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{properties.map((property) => (
								<PropertyCard key={property.id} property={property} />
							))}
						</ul>

						{totalPages > 1 ? (
							<nav
								aria-label="Pagination"
								className="mt-12 flex items-center justify-center gap-4 text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark"
							>
								{currentPage > 1 ? (
									<Link
										href={pageHref(filterParams, currentPage - 1)}
										className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:text-theme-blue dark:hover:text-white"
									>
										<ChevronLeft className="h-4 w-4" aria-hidden="true" />
										Previous
									</Link>
								) : (
									<span className="inline-flex items-center gap-1 px-3 py-2 opacity-40">
										<ChevronLeft className="h-4 w-4" aria-hidden="true" />
										Previous
									</span>
								)}
								<span className="text-theme-blue dark:text-white">
									Page {currentPage} of {totalPages}
								</span>
								{currentPage < totalPages ? (
									<Link
										href={pageHref(filterParams, currentPage + 1)}
										className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:text-theme-blue dark:hover:text-white"
									>
										Next
										<ChevronRight className="h-4 w-4" aria-hidden="true" />
									</Link>
								) : (
									<span className="inline-flex items-center gap-1 px-3 py-2 opacity-40">
										Next
										<ChevronRight className="h-4 w-4" aria-hidden="true" />
									</span>
								)}
							</nav>
						) : null}
					</>
				)}
			</div>
		</section>
	);
}
