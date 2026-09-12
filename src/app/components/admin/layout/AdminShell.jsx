"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { navigationGroups, BASE_URL } from "@/app/data/Navigation";
import AdminHeader from "@/app/components/admin/header/Header";
import { logoutAction } from "@/features/auth/actions";

const COLLAPSE_STORAGE_KEY = "admin:sidebar-collapsed";

function isItemActive(href, pathname) {
	const relativeHref = href.replace(BASE_URL, "");
	if (relativeHref === "/admin") return pathname === "/admin";
	return pathname === relativeHref || pathname.startsWith(`${relativeHref}/`);
}

const AdminShell = ({ user, permissions, siteName = "ConeyRealty", logoUrl = "/logo/conyrealty-logo.jpg", children }) => {
	const pathname = usePathname();
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const [isCollapsed, setCollapsed] = useState(false);
	const [isLoggingOut, startLogout] = useTransition();

	// Nav items are gated by the role's actual page permissions, not
	// hardcoded per-role exceptions — a page with no can_view for this role
	// (e.g. Agent on Users/Blogs) just doesn't render, and an empty group
	// (all its items filtered out) doesn't render its header either.
	const visibleGroups = navigationGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => item.alwaysVisible || permissions?.[item.pageKey]?.can_view),
		}))
		.filter((group) => group.items.length > 0);

	useEffect(() => {
		setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
	}, []);

	function toggleCollapsed() {
		setCollapsed((current) => {
			const next = !current;
			localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
			return next;
		});
	}

	// Text/labels should only disappear on desktop when collapsed — the mobile
	// drawer always shows the full expanded content, so this only ever adds
	// an `lg:` variant, never hides anything below that breakpoint.
	const hideWhenCollapsed = isCollapsed ? "lg:hidden" : "";

	return (
		<div className="h-dvh bg-bg-light dark:bg-bg-dark flex">
			{/* Mobile scrim — closes the drawer on outside tap, mirrors the desktop
			    sidebar's own translate transition so it fades in lockstep. */}
			<div
				onClick={() => setSidebarOpen(false)}
				aria-hidden="true"
				className={`fixed inset-0 z-40 bg-theme-blue-deep/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
					isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			/>

			{/* Sidebar - Desktop */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-linear-to-b from-theme-blue via-theme-blue to-theme-blue-deep shadow-[8px_0_32px_-12px_rgba(6,21,39,.35)] transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "lg:w-[84px]" : "lg:w-72"}`}
			>
				<div className="flex h-full flex-col">
					{/* Brand */}
					<div className={`relative flex items-center gap-3 px-5 pb-5 pt-6 ${isCollapsed ? "lg:justify-center lg:px-3" : ""}`}>
						<button
							onClick={() => setSidebarOpen(false)}
							className="lg:hidden absolute top-4 right-4 p-2 text-theme-gold-light/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
							aria-label="Close sidebar"
						>
							<X size={22} strokeWidth={2.5} />
						</button>
						<Image
							src={logoUrl}
							alt={siteName}
							width={36}
							height={36}
							unoptimized
							className="h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-white/10"
						/>
						<div className={`min-w-0 ${hideWhenCollapsed}`}>
							<p className="truncate text-[15px] font-bold tracking-tight text-white">{siteName}</p>
							<p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-theme-gold-light/45">Admin</p>
						</div>
					</div>

					<div className="mx-5 border-t border-white/[0.07]" />

					{/* Nav Links */}
					<nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5">
						{visibleGroups.map((group) => (
							<div key={group.label}>
								<p
									className={`mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-theme-gold-light/35 ${hideWhenCollapsed}`}
								>
									{group.label}
								</p>
								{isCollapsed ? <div className="hidden lg:block mx-2 border-t border-white/[0.07] mb-2.5" /> : null}
								<div className="space-y-0.5">
									{group.items.map((item) => {
										const active = isItemActive(item.href, pathname);
										return (
											<Link
												key={item.name}
												href={item.href}
												title={item.name}
												className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
													isCollapsed ? "lg:justify-center lg:px-0" : ""
												} ${
													active
														? "bg-theme-gold/[0.14] text-white"
														: "text-theme-gold-light/60 hover:bg-white/[0.06] hover:text-white"
												}`}
											>
												{active ? (
													<span
														className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-theme-gold"
														aria-hidden="true"
													/>
												) : null}
												<item.icon
													size={19}
													strokeWidth={active ? 2.25 : 1.9}
													className={`shrink-0 ${active ? "text-theme-gold" : "transition-transform group-hover:scale-110"}`}
												/>
												<span className={`truncate text-[13.5px] ${active ? "font-semibold" : "font-medium"} ${hideWhenCollapsed}`}>
													{item.name}
												</span>
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</nav>

					<div className="mx-5 border-t border-white/[0.07]" />

					{/* Collapse toggle — desktop only */}
					<button
						type="button"
						onClick={toggleCollapsed}
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						className={`hidden lg:flex items-center gap-2 mx-3.5 mt-3 mb-1 px-3 py-2 text-[12px] font-semibold text-theme-gold-light/45 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all ${
							isCollapsed ? "lg:mx-auto lg:justify-center lg:px-2.5" : ""
						}`}
					>
						{isCollapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
						<span className={hideWhenCollapsed}>Collapse</span>
					</button>

					{/* Account chip */}
					<div className="p-3.5">
						<div
							className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.06] ${isCollapsed ? "lg:flex-col lg:gap-2" : ""}`}
						>
							<Link href="/admin/settings" title="My profile" className="flex min-w-0 flex-1 items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-gold text-[13px] font-bold text-theme-blue">
									{(user.full_name || user.email)[0]?.toUpperCase()}
								</div>
								<div className={`min-w-0 flex-1 overflow-hidden ${hideWhenCollapsed}`}>
									<p className="truncate text-[13px] font-semibold text-white">{user.full_name || user.email}</p>
									<p className="truncate text-[11px] text-theme-gold-light/45">{user.role}</p>
								</div>
							</Link>
							<button
								type="button"
								onClick={() => startLogout(() => logoutAction())}
								disabled={isLoggingOut}
								aria-label="Sign out"
								className="rounded-full p-2 text-theme-gold-light/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
							>
								<LogOut size={15} />
							</button>
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* Header */}
				<AdminHeader isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
				{/* Dashboard Body */}
				<main className="flex-1 overflow-y-auto p-4 lg:p-8">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
};

export default AdminShell;
