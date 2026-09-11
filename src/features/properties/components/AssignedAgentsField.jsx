"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, UserPlus, X } from "lucide-react";

const ROLE_BADGE_CLASSES = {
	SAdmin: "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue",
	Admin: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	Manager: "bg-theme-gray/20 text-txt-secondary dark:text-txt-secondary-dark",
	Agent: "bg-theme-gray/10 text-txt-muted dark:text-txt-muted-dark",
};

function AgentAvatar({ user, size = 24 }) {
	const initials = (user.full_name || user.email)[0]?.toUpperCase() ?? "?";

	if (user.avatarUrl) {
		return (
			<span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
				<Image src={user.avatarUrl} alt="" fill sizes={`${size}px`} unoptimized className="object-cover object-top" />
			</span>
		);
	}

	return (
		<span
			className="flex shrink-0 items-center justify-center rounded-full bg-theme-gold font-bold text-theme-blue"
			style={{ width: size, height: size, fontSize: size * 0.42 }}
		>
			{initials}
		</span>
	);
}

// Chip-based multi-select for assigning agents to a property — replaces a
// bare native <select multiple>, which gave no clear read on who was
// actually picked (especially past a handful of options) without carefully
// scanning highlighted rows. Selected agents render as removable chips with
// their photo, so "who's assigned right now" is legible at a glance; adding
// more happens through a searchable dropdown instead of Cmd/Ctrl-clicking.
export default function AssignedAgentsField({ value, onChange, agents }) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);

	const selectedIds = value ?? [];
	const agentsById = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents]);
	const selectedAgents = selectedIds.map((id) => agentsById.get(id)).filter(Boolean);

	const availableAgents = agents.filter((agent) => !selectedIds.includes(agent.id));
	const filteredAvailable = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return availableAgents;
		return availableAgents.filter((agent) =>
			`${agent.full_name ?? ""} ${agent.email}`.toLowerCase().includes(needle),
		);
	}, [availableAgents, query]);

	useEffect(() => {
		if (!isOpen) return undefined;

		function handleClickOutside(event) {
			if (!containerRef.current?.contains(event.target)) setIsOpen(false);
		}
		function handleKeyDown(event) {
			if (event.key === "Escape") setIsOpen(false);
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		searchInputRef.current?.focus();
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) setQuery("");
	}, [isOpen]);

	function addAgent(id) {
		onChange([...selectedIds, id]);
	}

	function removeAgent(id) {
		onChange(selectedIds.filter((existingId) => existingId !== id));
	}

	return (
		<div ref={containerRef} className="relative">
			<div className="flex flex-wrap items-center gap-2 rounded-xl border border-theme-gray/25 bg-white p-2.5 dark:border-border-dark dark:bg-surface-dark-raised">
				{selectedAgents.length === 0 ? (
					<p className="px-1 text-sm text-txt-muted dark:text-txt-muted-dark">No agents assigned yet.</p>
				) : (
					selectedAgents.map((agent) => (
						<span
							key={agent.id}
							className="inline-flex items-center gap-1.5 rounded-full bg-theme-gold-light py-1 pl-1 pr-2 dark:bg-white/5"
						>
							<AgentAvatar user={agent} size={22} />
							<span className="max-w-40 truncate text-xs font-semibold text-theme-blue dark:text-theme-gold">
								{agent.full_name || agent.email}
							</span>
							<button
								type="button"
								onClick={() => removeAgent(agent.id)}
								aria-label={`Remove ${agent.full_name || agent.email}`}
								className="rounded-full p-0.5 text-theme-blue/60 hover:bg-theme-gold/40 hover:text-theme-blue dark:text-theme-gold/60 dark:hover:bg-white/10 dark:hover:text-theme-gold"
							>
								<X className="h-3 w-3" aria-hidden="true" />
							</button>
						</span>
					))
				)}

				<button
					type="button"
					onClick={() => setIsOpen((open) => !open)}
					className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-theme-gray/40 px-2.5 py-1 text-xs font-semibold text-txt-secondary transition-colors hover:border-theme-gold hover:text-theme-blue dark:border-border-dark dark:text-txt-secondary-dark dark:hover:border-theme-gold dark:hover:text-theme-gold"
				>
					<UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
					Add agent
				</button>
			</div>

			{isOpen ? (
				<div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-theme-gold-light/70 bg-white shadow-[0_12px_32px_-12px_rgba(20,20,20,.25)] dark:border-border-dark dark:bg-surface-dark">
					<div className="flex items-center gap-2 border-b border-theme-gold-light/70 px-3 py-2 dark:border-border-dark">
						<Search className="h-3.5 w-3.5 shrink-0 text-txt-muted dark:text-txt-muted-dark" aria-hidden="true" />
						<input
							ref={searchInputRef}
							type="text"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search agents by name or email…"
							className="w-full bg-transparent text-sm text-txt-primary outline-none placeholder:text-txt-muted dark:text-txt-primary-dark dark:placeholder:text-txt-muted-dark"
						/>
					</div>

					<ul className="max-h-56 overflow-y-auto p-1.5">
						{filteredAvailable.length === 0 ? (
							<li className="px-2.5 py-3 text-center text-xs text-txt-muted dark:text-txt-muted-dark">
								{availableAgents.length === 0 ? "Everyone's already assigned." : "No matching agents."}
							</li>
						) : (
							filteredAvailable.map((agent) => (
								<li key={agent.id}>
									<button
										type="button"
										onClick={() => addAgent(agent.id)}
										className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-theme-gold-light dark:hover:bg-white/5"
									>
										<AgentAvatar user={agent} size={28} />
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium text-txt-primary dark:text-txt-primary-dark">
												{agent.full_name || agent.email}
											</span>
											<span className="block truncate text-xs text-txt-muted dark:text-txt-muted-dark">{agent.email}</span>
										</span>
										<span
											className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_CLASSES[agent.role] ?? ""}`}
										>
											{agent.role}
										</span>
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			) : null}
		</div>
	);
}
