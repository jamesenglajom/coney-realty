import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BedDouble, Bath, Ruler, SquareStack, Car, Pencil } from "lucide-react";
import { getCurrentUser, getPagePermissions } from "@/features/auth/permissions";
import { getPublicPropertyBySlug } from "@/features/homepage/queries";
import { getAvatarForSeed, getPropertyImageForSeed, formatPrice } from "@/features/homepage/data";
import PropertyPhotoGallery from "@/features/properties/components/PropertyPhotoGallery";
import GetMyUrlButton from "@/features/viewings/components/GetMyUrlButton";
import Button from "@/components/ui/Button";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const property = await getPublicPropertyBySlug(slug);
	if (!property) return {};

	const description =
		[property.location, property.property_type, formatPrice(property.price)].filter(Boolean).join(" · ") ||
		`${property.name} — a listing with ConeyRealty.`;

	// Real photo when one exists — falls back to the same deterministic
	// placeholder the page itself shows, so the share preview never mismatches
	// what a visitor actually sees when they click through.
	const ogImage = property.imageUrls?.[0] ?? getPropertyImageForSeed(property.id);

	return {
		title: property.name,
		description,
		alternates: { canonical: `/property/${property.slug}` },
		openGraph: {
			title: property.name,
			description,
			images: [ogImage],
		},
	};
}

function formatUnit(value, unit) {
	if (value == null) return null;
	const number = typeof value === "number" ? value.toLocaleString() : value;
	return unit ? `${number} ${unit}` : String(number);
}

export default async function PublicPropertyPage({ params }) {
	const { slug } = await params;
	const [property, currentUser] = await Promise.all([getPublicPropertyBySlug(slug), getCurrentUser()]);

	if (!property) notFound();

	// Lets SAdmin/Admin/Manager jump straight from the live listing into its
	// admin edit form — Agents don't get "edit" on the properties page (see
	// the permissions table), so this naturally excludes them too instead of
	// hardcoding a role list here.
	const canEditProperty = currentUser ? (await getPagePermissions(currentUser.role, "properties")).can_edit : false;

	// One stat block per fact that's actually present — a Land listing might
	// only ever have a lot size, a House and Lot has the full set. Order
	// mirrors how a buyer scans a listing: bedrooms first, land size last.
	const stats = [
		property.beds != null && { icon: BedDouble, value: property.beds, label: property.beds === 1 ? "Bed" : "Beds" },
		property.baths != null && { icon: Bath, value: property.baths, label: property.baths === 1 ? "Bath" : "Baths" },
		property.floorAreaSqm != null && { icon: SquareStack, value: formatUnit(property.floorAreaSqm, "sqm"), label: "Floor area" },
		property.lotAreaSqm != null && { icon: Ruler, value: formatUnit(property.lotAreaSqm, "sqm"), label: "Lot size" },
		property.carpark != null && { icon: Car, value: property.carpark, label: property.carpark === 1 ? "Carpark" : "Carparks" },
	].filter(Boolean);

	// Curated facts, public-safe (see getPublicPropertyBySlug) — only ones
	// with a real value show up, so this reads the same for a bare Land
	// parcel as it does for a fully-detailed House and Lot.
	const facts = [
		{ label: "Property type", value: property.property_type },
		property.zone_type && { label: "Zone type", value: property.zone_type },
		property.terrain && { label: "Terrain", value: property.terrain },
		property.condition && { label: "Condition", value: property.condition },
		property.furnishing && { label: "Furnishing", value: property.furnishing },
		property.age != null && { label: "Age", value: property.age },
		property.titleStatus && { label: "Title status", value: property.titleStatus },
		property.payment_type && { label: "Payment type", value: property.payment_type, capitalize: true },
		property.requiredDownPayment && { label: "Down payment", value: property.requiredDownPayment },
		property.cashPrice && { label: "Cash price", value: property.cashPrice },
	].filter(Boolean);

	return (
		<div className="py-10 sm:py-16">
			<div className="mx-auto max-w-5xl px-5 sm:px-8">
				<div className="flex items-center justify-between gap-3">
					<Link
						href="/properties"
						className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back to properties
					</Link>
					<div className="flex items-center gap-2">
						{canEditProperty ? (
							<Button href={`/admin/properties/${property.id}/edit`} variant="ghost" size="sm">
								<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
								Edit listing
							</Button>
						) : null}
						{currentUser ? <GetMyUrlButton userId={currentUser.id} /> : null}
					</div>
				</div>
			</div>

			{/* Full-bleed — deliberately outside the max-w-5xl/px wrapper above so
			    the gallery (main image + thumbnail strip) spans the entire page
			    width, not just the content column. */}
			<div className="mt-4">
				<PropertyPhotoGallery
					images={property.imageUrls}
					seed={property.id}
					alt={property.name}
					badge={
						<div className="flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-theme-blue backdrop-blur-sm dark:bg-black/70 dark:text-white">
								{property.property_type}
							</span>
							{property.isOnHold ? (
								<span className="inline-flex items-center rounded-full bg-warning px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm dark:bg-warning-dark dark:text-theme-blue">
									On Hold
								</span>
							) : null}
						</div>
					}
				/>
			</div>

			<div className="mx-auto max-w-5xl px-5 sm:px-8">
				{/* Title/price used to be composed on top of the main image; now its
				    own header, sitting above the specs section instead. */}
				<div className="mt-6 flex flex-wrap items-end justify-between gap-3">
					<div className="min-w-0">
						<h1 className="font-display text-[clamp(22px,4vw,34px)] font-semibold leading-tight text-theme-blue dark:text-white">
							{property.name}
						</h1>
						{property.location ? (
							<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{property.location}</p>
						) : null}
					</div>
					<p className="whitespace-nowrap font-display text-[clamp(22px,3.5vw,30px)] font-semibold text-theme-blue dark:text-accent-dark">
						{formatPrice(property.price)}
					</p>
				</div>

				{stats.length > 0 ? (
					<div className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-theme-gray/15 bg-theme-gray/15 dark:border-border-dark dark:bg-border-dark sm:grid-cols-5">
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="flex flex-col items-center gap-1 bg-white px-2 py-3 text-center dark:bg-surface-dark-raised sm:gap-1.5 sm:px-4 sm:py-5"
							>
								<stat.icon className="h-5 w-5 text-theme-gold" aria-hidden="true" />
								<p className="text-sm font-bold text-theme-blue dark:text-white sm:text-base">{stat.value}</p>
								<p className="text-[10px] font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark sm:text-[11px]">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				) : null}

				<div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
					<div className="min-w-0">
						{property.html_body ? (
							<>
								<h2 className="font-display text-xl font-semibold text-theme-blue dark:text-white">Description</h2>
								<div
									className="mt-4 max-w-none text-sm text-txt-secondary dark:text-txt-secondary-dark [&_a]:text-theme-blue [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-theme-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-theme-blue [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-theme-blue [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_a]:text-theme-gold dark:[&_h2]:text-white dark:[&_h3]:text-accent-dark"
									dangerouslySetInnerHTML={{ __html: property.html_body }}
								/>
							</>
						) : null}
					</div>

					<aside className="space-y-6">
						{facts.length > 0 ? (
							<div className="rounded-2xl border border-theme-gray/15 p-5 dark:border-border-dark dark:bg-surface-dark-raised">
								<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
									Property details
								</h2>
								<dl className="mt-4 space-y-3 text-sm">
									{facts.map((fact) => (
										<div
											key={fact.label}
											className="flex items-start justify-between gap-4 border-b border-theme-gray/10 pb-3 last:border-0 last:pb-0 dark:border-white/5"
										>
											<dt className="text-txt-muted dark:text-txt-muted-dark">{fact.label}</dt>
											<dd
												className={`text-right font-medium text-theme-blue dark:text-white ${fact.capitalize ? "capitalize" : ""}`}
											>
												{fact.value}
											</dd>
										</div>
									))}
								</dl>
							</div>
						) : null}

						<div>
							<Button href={`/schedule-viewing?property=${property.slug}`} className="w-full">
								Schedule a viewing
							</Button>
						</div>

						<div>
							<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Listing agent
							</h2>
							<div className="mt-4 space-y-4">
								{property.agents.length === 0 ? (
									<p className="text-sm text-txt-muted dark:text-txt-muted-dark">
										No agent is assigned yet —{" "}
										<Link
											href={`/schedule-viewing?property=${property.slug}`}
											className="font-semibold text-theme-blue hover:underline dark:text-theme-gold"
										>
											request a viewing
										</Link>{" "}
										and our team will follow up.
									</p>
								) : (
									property.agents.map((agent) => (
										<Link
											key={agent.id}
											href={`/agents/${agent.id}`}
											className="flex items-center gap-3 rounded-2xl border border-theme-gray/15 p-4 hover:border-theme-gold dark:border-border-dark dark:bg-surface-dark-raised dark:hover:border-theme-gold"
										>
											<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
												<Image
													src={agent.avatarUrl || getAvatarForSeed(agent.id)}
													alt={agent.name}
													fill
													sizes="44px"
													className="object-cover object-top"
												/>
											</div>
											<span className="min-w-0 truncate font-semibold text-theme-blue dark:text-white">{agent.name}</span>
										</Link>
									))
								)}
							</div>
						</div>
					</aside>
				</div>

				<div className="mt-16 text-center">
					<Link href="/properties" className="text-sm font-semibold text-theme-blue hover:underline dark:text-theme-gold">
						← Browse more properties
					</Link>
				</div>
			</div>
		</div>
	);
}
