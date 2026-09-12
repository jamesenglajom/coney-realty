import Link from "next/link";
import Image from "next/image";
import StickyHeaderShell from "./StickyHeaderShell";
import MobileMenu from "./MobileMenu";
import Button from "@/components/ui/Button";
import { getBrandSettings } from "@/features/brand/queries";

const NAV_LINKS = [
	{ href: "/properties", label: "Properties" },
	{ href: "/#search", label: "Find My Home" },
	{ href: "/#featured", label: "Featured homes" },
	{ href: "/#leaderboard", label: "Top producers" },
	{ href: "/#insight", label: "Insight" },
];

export default async function SiteHeader() {
	const brand = await getBrandSettings();

	return (
		<StickyHeaderShell>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
				<Link
					href="/#top"
					className="flex items-center gap-2 font-display text-xl font-semibold text-theme-blue dark:text-white"
				>
					<Image src={brand.logoUrl} alt={brand.siteName} width={28} height={28} unoptimized className="rounded-lg object-contain" />
					<span className="hidden md:inline">{brand.siteName}</span>
				</Link>

				<ul className="hidden items-center gap-7 md:flex">
					{NAV_LINKS.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="text-sm font-medium text-txt-secondary hover:text-theme-blue dark:text-txt-secondary-dark dark:hover:text-white"
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>

				<div className="flex items-center gap-2">
					<Button href="/schedule-viewing" variant="primary" className="hidden md:inline-flex">
						Schedule a viewing
					</Button>
					<MobileMenu>
						<ul className="grid gap-1 py-2">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="block rounded-lg px-2 py-3 text-sm font-medium text-txt-secondary hover:bg-theme-gold-light dark:text-txt-secondary-dark dark:hover:bg-white/5"
									>
										{link.label}
									</Link>
								</li>
							))}
							<li>
								<Button href="/schedule-viewing" variant="primary" className="mt-2 w-full">
									Schedule a viewing
								</Button>
							</li>
						</ul>
					</MobileMenu>
				</div>
			</div>
		</StickyHeaderShell>
	);
}
