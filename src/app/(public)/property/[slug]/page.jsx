import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bed, Bath, Ruler } from "lucide-react";
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

export default async function PublicPropertyPage({ params }) {
	const { slug } = await params;
	const property = await getPublicPropertyBySlug(slug);

	if (!property) notFound();

	const searchContext = { location: property.city_state, type: property.property_type };
	const hasBedsBaths = property.beds != null || property.baths != null;

	return (
		<div className="py-16 sm:py-24">
			<div className="mx-auto max-w-5xl px-5 sm:px-8">
				<Link
					href="/properties"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back to properties
				</Link>

				<div className="mt-6">
					<PropertyPhotoGallery slug={property.slug} seed={property.id} alt={property.name} />
				</div>

				<div className="mt-8 flex flex-wrap items-start justify-between gap-4">
					<div>
						<span className="inline-flex items-center rounded-full bg-theme-gold-light px-3 py-1 text-xs font-semibold text-theme-blue dark:bg-white/10 dark:text-theme-gold">
							{property.property_type}
						</span>
						<h1 className="mt-3 font-display text-[clamp(28px,4vw,42px)] font-semibold leading-tight text-theme-blue dark:text-white">
							{property.name}
						</h1>
						{property.location ? (
							<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{property.location}</p>
						) : null}
					</div>
					<p className="whitespace-nowrap text-2xl font-semibold text-theme-blue dark:text-theme-gold">
						{formatPrice(property.price)}
					</p>
				</div>

				{hasBedsBaths || property.lotAreaSqm != null ? (
					<div className="mt-6 flex flex-wrap gap-6 border-y border-theme-gray/15 py-4 text-sm text-txt-secondary dark:border-white/10 dark:text-txt-secondary-dark">
						{property.beds != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bed className="h-4 w-4" aria-hidden="true" />
								{property.beds} bedrooms
							</span>
						) : null}
						{property.baths != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bath className="h-4 w-4" aria-hidden="true" />
								{property.baths} bathrooms
							</span>
						) : null}
						{property.lotAreaSqm != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Ruler className="h-4 w-4" aria-hidden="true" />
								{property.lotAreaSqm.toLocaleString()} sqm lot
							</span>
						) : null}
					</div>
				) : null}

				{property.html_body ? (
					<div
						className="mt-8 max-w-none text-sm text-txt-secondary dark:text-txt-secondary-dark [&_a]:text-theme-blue [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-theme-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-theme-blue [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-theme-blue [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_a]:text-theme-gold dark:[&_h2]:text-white dark:[&_h3]:text-white"
						dangerouslySetInnerHTML={{ __html: property.html_body }}
					/>
				) : null}

				<div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
					<div className="space-y-4">
						{property.zone_type ? (
							<div className="rounded-2xl border border-theme-gray/15 p-4 dark:border-white/10">
								<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
									Zone type
								</p>
								<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">{property.zone_type}</p>
							</div>
						) : null}
						{property.payment_type || property.payment_terms ? (
							<div className="rounded-2xl border border-theme-gray/15 p-4 dark:border-white/10">
								<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
									Payment
								</p>
								<p className="mt-1 text-sm capitalize text-txt-secondary dark:text-txt-secondary-dark">
									{property.payment_type || "—"}
								</p>
								{property.payment_terms ? (
									<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">{property.payment_terms}</p>
								) : null}
							</div>
						) : null}
					</div>

					<aside className="space-y-4">
						<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							Contact the listing agent
						</h2>
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
								<div
									key={agent.id}
									className="rounded-2xl border border-theme-gray/15 p-4 dark:border-white/10"
								>
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
