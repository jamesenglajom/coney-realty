import { listFeaturedProperties } from "@/features/homepage/queries";
import SectionHeading from "./ui/SectionHeading";
import Button from "@/components/ui/Button";
import PropertyCard from "./PropertyCard";

// Deliberately doesn't fetch getCurrentUser() (unlike /properties and the
// PDP, which the agent-gated Share button was actually requested for) —
// that reads the session cookie, which would force this entire homepage
// section from static/ISR into fully dynamic rendering on every request,
// for a feature this section wasn't asked for. Its cards still get the
// Bookmark button (no session needed), just no Share button.
export default async function FeaturedHomes() {
	const properties = await listFeaturedProperties(6);

	if (properties.length === 0) return null;

	return (
		<section id="featured" className="py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						eyebrow="Featured homes"
						title="A taste of the current collection"
						description="We show the shape of a home — never the full file. Exact address, disclosures, and viewings come from the listing agent, so nothing here can be scraped and re-listed."
					/>
					<div className="flex gap-2 self-start sm:self-auto">
						<Button href="/properties" variant="ghost">
							View all properties
						</Button>
						<Button href="/#search" variant="ghost">
							Search by your criteria
						</Button>
					</div>
				</div>
				<ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{properties.map((property) => (
						<PropertyCard key={property.id} property={property} />
					))}
				</ul>
			</div>
		</section>
	);
}
