import Link from "next/link";
import Image from "next/image";
import StickyHeaderShell from "./StickyHeaderShell";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import Button from "@/components/ui/Button";

const NAV_LINKS = [
	{ href: "/#search", label: "Find an agent" },
	{ href: "/#featured", label: "Featured homes" },
	{ href: "/#leaderboard", label: "Top agents" },
	{ href: "/#insight", label: "Insight" },
];

export default function SiteHeader() {
	return (
		<StickyHeaderShell>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
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
					<ThemeToggle />
					<Button href="/#search" variant="primary" className="hidden sm:inline-flex">
						Get matched
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
								<Button href="/#search" variant="primary" className="mt-2 w-full">
									Get matched
								</Button>
							</li>
						</ul>
					</MobileMenu>
				</div>
			</div>
		</StickyHeaderShell>
	);
}
