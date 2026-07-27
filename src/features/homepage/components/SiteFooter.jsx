import Link from "next/link";
import Image from "next/image";

const EXPLORE_LINKS = [
	{ href: "/#search", label: "Find an agent" },
	{ href: "/#featured", label: "Featured homes" },
	{ href: "/#leaderboard", label: "Top agents" },
	{ href: "/#insight", label: "Insight" },
];
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

export default function SiteFooter() {
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
					<address className="mt-4 text-sm not-italic text-txt-muted dark:text-txt-muted-dark">
						123 Cedar Row, Austin, TX 78701
						<br />
						<a href="tel:+15125550100" className="hover:text-theme-blue dark:hover:text-white">
							+1 (512) 555-0100
						</a>
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
