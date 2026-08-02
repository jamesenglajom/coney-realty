"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function humanize(segment) {
	return decodeURIComponent(segment)
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Route structure here doesn't always match the logical hierarchy we want to
// show (e.g. /admin/property/[slug] is conceptually under Properties but
// isn't nested under /admin/properties in the URL), so this maps known
// routes explicitly rather than mechanically walking path segments.
function buildCrumbs(pathname) {
	if (pathname === "/admin") return [];

	if (pathname.startsWith("/admin/users")) {
		const crumbs = [{ label: "Users", href: "/admin/users" }];
		if (pathname === "/admin/users/new") crumbs.push({ label: "New" });
		else if (pathname.endsWith("/edit")) crumbs.push({ label: "Edit" });
		return crumbs;
	}

	if (pathname.startsWith("/admin/blogs")) {
		const crumbs = [{ label: "Blogs", href: "/admin/blogs" }];
		if (pathname === "/admin/blogs/new") crumbs.push({ label: "New" });
		else if (pathname.endsWith("/edit")) crumbs.push({ label: "Edit" });
		return crumbs;
	}

	if (pathname.startsWith("/admin/properties")) {
		const crumbs = [{ label: "Properties", href: "/admin/properties" }];
		if (pathname === "/admin/properties/new") crumbs.push({ label: "New" });
		else if (pathname === "/admin/properties/import") crumbs.push({ label: "Import" });
		else if (pathname.endsWith("/edit")) crumbs.push({ label: "Edit" });
		return crumbs;
	}

	if (pathname.startsWith("/admin/property/")) {
		const slug = pathname.split("/")[3] ?? "";
		return [{ label: "Properties", href: "/admin/properties" }, { label: humanize(slug) }];
	}

	if (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/profile")) {
		return [{ label: "Settings", href: "/admin/settings" }];
	}

	const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
	return lastSegment ? [{ label: humanize(lastSegment) }] : [];
}

export default function Breadcrumbs() {
	const pathname = usePathname();
	const crumbs = buildCrumbs(pathname);

	return (
		<nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
			<Link
				href="/admin"
				className="flex shrink-0 items-center gap-1 text-txt-secondary hover:text-theme-blue dark:text-txt-secondary-dark dark:hover:text-white"
			>
				<Home className="h-4 w-4" aria-hidden="true" />
				{crumbs.length === 0 ? <span className="font-medium text-theme-blue dark:text-white">Dashboard</span> : null}
			</Link>
			{crumbs.map((crumb, index) => {
				const isLast = index === crumbs.length - 1;
				return (
					<span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
						<ChevronRight className="h-3.5 w-3.5 shrink-0 text-txt-muted dark:text-txt-muted-dark" aria-hidden="true" />
						{crumb.href && !isLast ? (
							<Link
								href={crumb.href}
								className="truncate text-txt-secondary hover:text-theme-blue dark:text-txt-secondary-dark dark:hover:text-white"
							>
								{crumb.label}
							</Link>
						) : (
							<span className="truncate font-medium text-theme-blue dark:text-white">{crumb.label}</span>
						)}
					</span>
				);
			})}
		</nav>
	);
}
