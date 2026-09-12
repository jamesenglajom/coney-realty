import Link from "next/link";
import Image from "next/image";
import { getBrandSettings } from "@/features/brand/queries";

const EXPLORE_LINKS = [
	{ href: "/#search", label: "Search homes" },
	{ href: "/#featured", label: "Featured homes" },
	{ href: "/#leaderboard", label: "Top producers" },
	{ href: "/#insight", label: "Insight" },
];

// Real, distinct pages (not homepage anchors) — every one of these needs to
// resolve to actual content, not a stub, per the "no dead links" rule for
// this footer.
const GET_STARTED_LINKS = [
	{ href: "/properties", label: "Browse properties" },
	{ href: "/blog", label: "Blog" },
	{ href: "/schedule-viewing", label: "Schedule a viewing" },
];

function FooterColumn({ title, links }) {
	return (
		<nav aria-label={title}>
			<h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-txt-muted dark:text-txt-muted-dark">
				{title}
			</h3>
			<ul className="mt-4 grid gap-2.5">
				{links.map((link) => (
					<li key={link.label}>
						<Link
							href={link.href}
							className="text-sm text-txt-secondary hover:text-theme-blue dark:text-txt-secondary-dark dark:hover:text-white"
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

export default async function SiteFooter() {
	const brand = await getBrandSettings();
	const telHref = brand.contactNumber ? `tel:${brand.contactNumber.replace(/[^\d+]/g, "")}` : null;

	return (
		<footer className="border-t border-theme-gray/15 dark:border-border-dark">
			<div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
				<div>
					<Link
						href="/#top"
						className="flex items-center gap-2 font-display text-xl font-semibold text-theme-blue dark:text-white"
					>
						<Image src={brand.logoUrl} alt={brand.siteName} width={28} height={28} unoptimized className="rounded-lg object-contain" />
						{brand.siteName}
					</Link>
					<p className="mt-4 max-w-[280px] text-sm text-txt-muted dark:text-txt-muted-dark">
						A real estate platform built around people. Search homes, meet the agent, skip the scrape-able
						listing feeds.
					</p>
					{brand.address || brand.contactNumber || brand.contactEmail ? (
						<address className="mt-4 whitespace-pre-line text-sm not-italic text-txt-muted dark:text-txt-muted-dark">
							{brand.address ? (
								<>
									{brand.address}
									<br />
								</>
							) : null}
							{brand.contactNumber ? (
								<>
									<a href={telHref} className="hover:text-theme-blue dark:hover:text-white">
										{brand.contactNumber}
									</a>
									<br />
								</>
							) : null}
							{brand.contactEmail ? (
								<a href={`mailto:${brand.contactEmail}`} className="hover:text-theme-blue dark:hover:text-white">
									{brand.contactEmail}
								</a>
							) : null}
						</address>
					) : null}
				</div>
				<FooterColumn title="Explore" links={EXPLORE_LINKS} />
				<FooterColumn title="Get started" links={GET_STARTED_LINKS} />
			</div>
			<div className="border-t border-theme-gray/15 dark:border-border-dark">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-txt-muted dark:text-txt-muted-dark sm:flex-row sm:px-8">
					<p>© 2026 {brand.siteName}. All rights reserved.</p>
					<p>Equal Housing Opportunity</p>
				</div>
			</div>
		</footer>
	);
}
