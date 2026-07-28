"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { navigationGroups, BASE_URL } from "@/app/data/Navigation";
import AdminHeader from "@/app/components/admin/header/Header";
import PageHeader from "@/app/components/admin/page-header/PageHeader1";
import { logoutAction } from "@/features/auth/actions";

const COLLAPSE_STORAGE_KEY = "admin:sidebar-collapsed";

function isItemActive(href, pathname) {
	const relativeHref = href.replace(BASE_URL, "");
	if (relativeHref === "/admin") return pathname === "/admin";
	return pathname === relativeHref || pathname.startsWith(`${relativeHref}/`);
}

const AdminShell = ({ user, permissions, children }) => {
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
		<div className="h-dvh bg-[#fcfcfc] dark:bg-black flex">
			{/* Sidebar - Desktop */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-theme-blue transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
			>
				<div className="h-full flex flex-col">
					{/* Logo Section */}
					<div className={`relative flex items-center gap-3 p-6 ${isCollapsed ? "lg:justify-center lg:px-3" : ""}`}>
						<button
							onClick={() => setSidebarOpen(false)}
							className="lg:hidden absolute top-4 right-4 p-2 text-theme-gold-light/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
							aria-label="Close sidebar"
						>
							<X size={24} strokeWidth={2.5} />
						</button>
						<Image
							src="/logo/conyrealty-logo.jpg"
							alt="ConeyRealty"
							width={32}
							height={32}
							className="w-8 h-8 shrink-0 rounded-md"
						/>
						<span className={`text-white font-bold tracking-tight text-lg ${hideWhenCollapsed}`}>ConeyRealty</span>
					</div>

					{/* Collapse toggle — desktop only */}
					<button
						type="button"
						onClick={toggleCollapsed}
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						className={`hidden lg:flex items-center gap-2 mx-4 mb-2 px-3 py-2 text-theme-gold-light/60 hover:text-white hover:bg-white/5 rounded-lg transition-all ${
							isCollapsed ? "lg:mx-auto lg:justify-center" : ""
						}`}
					>
						{isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
						<span className={hideWhenCollapsed}>Collapse</span>
					</button>

					{/* Nav Links */}
					<nav className="flex-1 px-4 space-y-5 overflow-y-auto">
						{visibleGroups.map((group) => (
							<div key={group.label}>
								<p
									className={`px-4 mb-1 text-[11px] font-semibold uppercase tracking-wider text-theme-gold-light/40 ${hideWhenCollapsed}`}
								>
									{group.label}
								</p>
								{isCollapsed ? <div className="hidden lg:block mx-4 border-t border-white/10 mb-2" /> : null}
								<div className="space-y-1">
									{group.items.map((item) => {
										const active = isItemActive(item.href, pathname);
										return (
											<Link
												key={item.name}
												href={item.href}
												title={item.name}
												className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
													isCollapsed ? "lg:justify-center lg:px-0" : ""
												} ${
													active
														? "bg-theme-gold text-theme-blue font-semibold"
														: "text-theme-gold-light/70 hover:text-theme-gold hover:bg-white/5"
												}`}
											>
												<item.icon
													size={20}
													className={active ? "" : "group-hover:scale-110 transition-transform"}
												/>
												<span className={`font-medium ${hideWhenCollapsed}`}>{item.name}</span>
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</nav>

					{/* User Profile Mini */}
					<div className="p-4 border-t border-white/10">
						<div className={`flex items-center gap-3 p-2 ${isCollapsed ? "lg:flex-col lg:gap-2" : ""}`}>
							<Link
								href="/admin/settings"
								title="My profile"
								className="flex flex-1 min-w-0 items-center gap-3 rounded-lg transition-colors hover:bg-white/5"
							>
								<div className="w-10 h-10 shrink-0 rounded-full bg-theme-gold flex items-center justify-center font-bold text-theme-blue">
									{(user.full_name || user.email)[0]?.toUpperCase()}
								</div>
								<div className={`overflow-hidden flex-1 min-w-0 ${hideWhenCollapsed}`}>
									<p className="text-white text-sm font-medium truncate">{user.full_name || user.email}</p>
									<p className="text-theme-gold-light/50 text-xs truncate">{user.role}</p>
								</div>
							</Link>
							<button
								type="button"
								onClick={() => startLogout(() => logoutAction())}
								disabled={isLoggingOut}
								aria-label="Sign out"
								className="p-2 text-theme-gold-light/70 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
							>
								<LogOut size={16} />
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
					<div className="max-w-7xl mx-auto">
						<PageHeader />

						{children}
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminShell;
