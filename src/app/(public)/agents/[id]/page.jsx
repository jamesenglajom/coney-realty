import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Ruler } from "lucide-react";
import { getAgentProfile } from "@/features/homepage/queries";
import { getAvatarForSeed, formatPrice } from "@/features/homepage/data";
import Button from "@/components/ui/Button";
import PropertyCoverImage from "@/features/properties/components/PropertyCoverImage";

export async function generateMetadata({ params }) {
	const { id } = await params;
	const agent = await getAgentProfile(id);

	if (!agent) return {};

	return {
		title: `${agent.name} — Agent`,
		description: agent.bio || `${agent.name}'s active listings with ConeyRealty.`,
	};
}

export default async function AgentProfilePage({ params }) {
	const { id } = await params;
	const agent = await getAgentProfile(id);

	if (!agent) notFound();

	return (
		<div className="py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
					<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-theme-gold">
						<Image
							src={agent.avatarUrl || getAvatarForSeed(agent.id)}
							alt={agent.name}
							fill
							sizes="112px"
							className="object-cover"
						/>
					</div>
					<div className="min-w-0">
						<h1 className="font-display text-[clamp(28px,4vw,42px)] font-semibold leading-tight text-theme-blue dark:text-white">
							{agent.name}
						</h1>
						<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">
							{agent.listings.length} active listing{agent.listings.length === 1 ? "" : "s"}
						</p>
						{agent.bio ? (
							<p className="mt-4 max-w-2xl text-base text-txt-secondary dark:text-txt-secondary-dark">{agent.bio}</p>
						) : null}
						<div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
							<Button href={`mailto:${agent.email}?subject=ConeyRealty%20enquiry`} variant="primary" size="sm">
								Email {agent.name.split(" ")[0]}
							</Button>
							{agent.phone ? (
								<Button href={`tel:${agent.phone}`} variant="ghost" size="sm">
									Call {agent.phone}
								</Button>
							) : null}
						</div>
					</div>
				</div>

				<div className="mt-16">
					<h2 className="font-display text-2xl font-semibold text-theme-blue dark:text-white">Active listings</h2>

					{agent.listings.length === 0 ? (
						<p className="mt-4 text-sm text-txt-muted dark:text-txt-muted-dark">
							No active listings from {agent.name} right now — reach out directly for off-market options.
						</p>
					) : (
						<ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{agent.listings.map((listing) => (
								<li
									key={listing.id}
									className="overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]"
								>
									<Link href={`/property/${listing.slug}`}>
										<PropertyCoverImage slug={listing.slug} seed={listing.id} alt={listing.name} badge={listing.type} />
									</Link>
									<div className="p-5">
										<div className="flex items-baseline justify-between gap-3">
											<h3 className="text-lg font-semibold text-theme-blue dark:text-white">
												<Link href={`/property/${listing.slug}`} className="hover:underline">
													{listing.name}
												</Link>
											</h3>
											<span className="whitespace-nowrap font-semibold text-theme-blue dark:text-theme-gold">
												{formatPrice(listing.price)}
											</span>
										</div>
										{listing.city ? (
											<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{listing.city}</p>
										) : null}
										{listing.beds != null || listing.baths != null ? (
											<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
												{listing.beds != null ? (
													<span className="inline-flex items-center gap-1.5">
														<Bed className="h-4 w-4" aria-hidden="true" />
														{listing.beds} bd
													</span>
												) : null}
												{listing.baths != null ? (
													<span className="inline-flex items-center gap-1.5">
														<Bath className="h-4 w-4" aria-hidden="true" />
														{listing.baths} ba
													</span>
												) : null}
											</div>
										) : listing.lotAreaSqm != null ? (
											<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
												<span className="inline-flex items-center gap-1.5">
													<Ruler className="h-4 w-4" aria-hidden="true" />
													{listing.lotAreaSqm.toLocaleString()} sqm lot
												</span>
											</div>
										) : null}
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="mt-16">
					<Link href="/#search" className="text-sm font-semibold text-theme-blue hover:underline dark:text-theme-gold">
						← Search for a different agent
					</Link>
				</div>
			</div>
		</div>
	);
}
