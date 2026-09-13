import Link from "next/link";
import { Bed, Bath, Car, Ruler } from "lucide-react";
import { formatPrice } from "@/features/homepage/data";
import PropertyCoverImage from "@/features/properties/components/PropertyCoverImage";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import ShareButton from "@/features/bookmarks/components/ShareButton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const STATUS_LABELS = { sold: "Sold" };

// `property.status` is only ever present on the saved-properties page (see
// features/bookmarks/queries.js) — every other caller (PLP, featured
// section) already only ever hands this a published/on_hold property, so
// `isUnavailable` never trips there. A bookmarked property that's since
// sold/gone to draft/been archived still shows (that's the point of a saved
// list surviving status changes), just without a working link to a PDP that
// itself 404s for anything other than published/on_hold.
// `agentId` — the signed-in staff viewer's own id, passed down from a
// Server Component page's getCurrentUser() — gates the Share button
// entirely: a guest sees no share button at all, only a signed-in agent/
// admin gets one, and it's the one that rides ?agent=<id> along (see
// ShareButton). Bookmarking has nothing to do with staff attribution, so it
// stays available to everyone regardless of agentId.
export default function PropertyCard({ property, agentId }) {
	const hasBedsBaths = property.beds != null || property.baths != null;
	const isUnavailable = Boolean(property.status) && !["published", "on_hold"].includes(property.status);
	const href = `/property/${property.slug}`;

	const cover = (
		<PropertyCoverImage
			imageUrl={property.imageUrl}
			seed={property.id}
			alt={`${property.name}${property.city ? ` in ${property.city}` : ""}`}
			badge={property.type}
			className={`aspect-[4/3] ${isUnavailable ? "opacity-60 grayscale" : ""}`}
		/>
	);

	return (
		<li className="relative overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-border-dark dark:bg-surface-dark">
			<div className="absolute right-3 top-3 z-10 flex gap-2">
				<BookmarkButton propertyId={property.id} />
				{!isUnavailable && agentId ? <ShareButton path={href} title={property.name} agentId={agentId} /> : null}
			</div>

			{isUnavailable ? cover : <Link href={href}>{cover}</Link>}

			<div className="p-5">
				{isUnavailable ? (
					<Badge tone="neutral" className="mb-2">
						{STATUS_LABELS[property.status] ?? "No longer listed"}
					</Badge>
				) : property.isOnHold ? (
					<Badge tone="warning" className="mb-2">
						On Hold
					</Badge>
				) : null}
				<p className="text-2xl font-bold leading-tight text-theme-blue dark:text-theme-gold">
					{formatPrice(property.price)}
				</p>
				<h3 className="mt-1 text-lg font-semibold text-txt-secondary dark:text-txt-secondary-dark">
					{isUnavailable ? property.name : <Link href={href} className="hover:underline">{property.name}</Link>}
				</h3>
				{hasBedsBaths ? (
					<div className="mt-4 flex flex-wrap gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{property.beds != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bed className="h-4 w-4" aria-hidden="true" />
								{property.beds} bd
							</span>
						) : null}
						{property.baths != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bath className="h-4 w-4" aria-hidden="true" />
								{property.baths} ba
							</span>
						) : null}
						{property.carpark != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Car className="h-4 w-4" aria-hidden="true" />
								{property.carpark} cp
							</span>
						) : null}
					</div>
				) : property.lotAreaSqm != null ? (
					<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						<span className="inline-flex items-center gap-1.5">
							<Ruler className="h-4 w-4" aria-hidden="true" />
							{property.lotAreaSqm.toLocaleString()} sqm lot
						</span>
					</div>
				) : null}
				{isUnavailable ? null : (
					<Button href={href} variant="ghost" size="sm" shape="rounded" className="mt-5 w-full">
						View Property
					</Button>
				)}
			</div>
		</li>
	);
}
