import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BedDouble, Bath, Ruler, SquareStack, Car } from "lucide-react";
import { getPublicPropertyBySlug } from "@/features/homepage/queries";
import { getAvatarForSeed, getPropertyImageForSeed, formatPrice } from "@/features/homepage/data";
import ContactAgentButton from "@/features/homepage/components/ContactAgentButton";
import PropertyPhotoGallery from "@/features/properties/components/PropertyPhotoGallery";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const property = await getPublicPropertyBySlug(slug);
	if (!property) return {};

	const description =
		[property.location, property.property_type, formatPrice(property.price)].filter(Boolean).join(" · ") ||
		`${property.name} — a listing with ConeyRealty.`;

	return {
		title: property.name,
		description,
		alternates: { canonical: `/property/${property.slug}` },
		openGraph: {
			title: property.name,
			description,
			images: [getPropertyImageForSeed(property.id)],
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
	const property = await getPublicPropertyBySlug(slug);

	if (!property) notFound();

	const searchContext = { location: property.city_state, type: property.property_type };

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
				<Link
					href="/properties"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back to properties
				</Link>

				<div className="mt-4">
					<PropertyPhotoGallery
						slug={property.slug}
						seed={property.id}
						alt={property.name}
						badge={
							<span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-theme-blue backdrop-blur-sm dark:bg-black/70 dark:text-white">
								{property.property_type}
							</span>
						}
						overlay={
							<div className="flex flex-wrap items-end justify-between gap-3">
								<div className="min-w-0">
									<h1 className="font-display text-[clamp(22px,4vw,34px)] font-semibold leading-tight text-white">
										{property.name}
									</h1>
									{property.location ? <p className="mt-1 text-sm text-white/80">{property.location}</p> : null}
								</div>
								<p className="whitespace-nowrap font-display text-[clamp(22px,3.5vw,30px)] font-semibold text-theme-gold">
									{formatPrice(property.price)}
								</p>
							</div>
						}
					/>
				</div>

				{stats.length > 0 ? (
					<div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-theme-gray/15 bg-theme-gray/15 dark:border-white/10 dark:bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="flex flex-col items-center gap-1.5 bg-white px-4 py-5 text-center dark:bg-black"
							>
								<stat.icon className="h-5 w-5 text-theme-gold" aria-hidden="true" />
								<p className="text-base font-bold text-theme-blue dark:text-white">{stat.value}</p>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
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
									className="mt-4 max-w-none text-sm text-txt-secondary dark:text-txt-secondary-dark [&_a]:text-theme-blue [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-theme-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-theme-blue [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-theme-blue [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_a]:text-theme-gold dark:[&_h2]:text-white dark:[&_h3]:text-white"
									dangerouslySetInnerHTML={{ __html: property.html_body }}
								/>
							</>
						) : null}
					</div>

					<aside className="space-y-6">
						{facts.length > 0 ? (
							<div className="rounded-2xl border border-theme-gray/15 p-5 dark:border-white/10">
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
							<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
								Contact the listing agent
							</h2>
							<div className="mt-4 space-y-4">
								{property.agents.length === 0 ? (
									<p className="text-sm text-txt-muted dark:text-txt-muted-dark">
										Reach out via our{" "}
										<Link href="/#search" className="font-semibold text-theme-blue hover:underline dark:text-theme-gold">
											Find an agent
										</Link>{" "}
										search and we&apos;ll connect you.
									</p>
								) : (
									property.agents.map((agent) => (
										<div key={agent.id} className="rounded-2xl border border-theme-gray/15 p-4 dark:border-white/10">
											<div className="flex items-center gap-3">
												<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
													<Image
														src={agent.avatarUrl || getAvatarForSeed(agent.id)}
														alt={agent.name}
														fill
														sizes="44px"
														className="object-cover"
													/>
												</div>
												<Link
													href={`/agents/${agent.id}`}
													className="min-w-0 truncate font-semibold text-theme-blue hover:underline dark:text-white"
												>
													{agent.name}
												</Link>
											</div>
											<div className="mt-3 flex gap-2">
												<ContactAgentButton
													href={`mailto:${agent.email}?subject=ConeyRealty%20enquiry`}
													agentId={agent.id}
													method="email"
													searchContext={searchContext}
													variant="primary"
													className="flex-1 px-3 py-2 text-xs"
												>
													Email
												</ContactAgentButton>
												{agent.phone ? (
													<ContactAgentButton
														href={`tel:${agent.phone}`}
														agentId={agent.id}
														method="call"
														searchContext={searchContext}
														variant="ghost"
														className="px-3 py-2 text-xs"
													>
														Call
													</ContactAgentButton>
												) : null}
											</div>
										</div>
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
