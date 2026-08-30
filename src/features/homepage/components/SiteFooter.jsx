import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/features/system/queries";

const EXPLORE_LINKS = [
	{ href: "/#search", label: "Search homes" },
	{ href: "/#featured", label: "Featured homes" },
	{ href: "/#leaderboard", label: "Top producers" },
	{ href: "/#insight", label: "Insight" },
];

const FALLBACK_ADDRESS = "123 Cedar Row, Austin, TX 78701";
const FALLBACK_CONTACT_NUMBER = "+1 (512) 555-0100";
const COMPANY_LINKS = [
	{ href: "#", label: "About" },
	{ href: "#", label: "Careers" },
	{ href: "#", label: "Press" },
	{ href: "#", label: "Contact" },
];
const LEGAL_LINKS = [
	{ href: "#", label: "Privacy" },
	{ href: "#", label: "Terms" },
	{ href: "#", label: "Fair housing" },
	{ href: "#", label: "Accessibility" },
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
	const site = await getSiteSettings();
	const address = site.address || FALLBACK_ADDRESS;
	const contactNumber = site.contactNumber || FALLBACK_CONTACT_NUMBER;
	const telHref = `tel:${contactNumber.replace(/[^\d+]/g, "")}`;

	return (
		<footer className="border-t border-theme-gray/15 dark:border-white/10">
			<div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
				<div>
					<Link
						href="/#top"
						className="flex items-center gap-2 font-display text-xl font-semibold text-theme-blue dark:text-white"
					>
						<Image
							src="/logo/conyrealty-logo.jpg"
							alt="ConeyRealty"
							width={28}
							height={28}
							className="rounded-lg"
						/>
						ConeyRealty
					</Link>
					<p className="mt-4 max-w-[280px] text-sm text-txt-muted dark:text-txt-muted-dark">
						A real estate platform built around people. Search homes, meet the agent, skip the scrape-able
						listing feeds.
					</p>
					<address className="mt-4 whitespace-pre-line text-sm not-italic text-txt-muted dark:text-txt-muted-dark">
						{address}
						<br />
						<a href={telHref} className="hover:text-theme-blue dark:hover:text-white">
							{contactNumber}
						</a>
						{site.contactEmail ? (
							<>
								<br />
								<a
									href={`mailto:${site.contactEmail}`}
									className="hover:text-theme-blue dark:hover:text-white"
								>
									{site.contactEmail}
								</a>
							</>
						) : null}
					</address>
				</div>
				<FooterColumn title="Explore" links={EXPLORE_LINKS} />
				<FooterColumn title="Company" links={COMPANY_LINKS} />
				<FooterColumn title="Legal" links={LEGAL_LINKS} />
			</div>
			<div className="border-t border-theme-gray/15 dark:border-white/10">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-txt-muted dark:text-txt-muted-dark sm:flex-row sm:px-8">
					<p>© 2026 ConeyRealty. All rights reserved.</p>
					<p>Equal Housing Opportunity</p>
				</div>
			</div>
		</footer>
	);
}
