"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { PROPERTY_TYPES } from "../schemas";

const SELECT_CLASSES =
	"w-full rounded-xl border border-theme-gray/30 bg-white px-3 py-2 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold";

export default function PropertiesFilterBar({ cities, districts, zoneTypes, agents, showAgentFilter }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
	const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");

	function updateParam(key, value) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set(key, value);
		else params.delete(key);
		router.replace(`${pathname}?${params.toString()}`);
	}

	// Price inputs are debounced (typed character-by-character); selects push
	// to the URL immediately via updateParam on change.
	useEffect(() => {
		const current = searchParams.get("priceMin") ?? "";
		if (priceMin === current) return undefined;
		const timeout = setTimeout(() => updateParam("priceMin", priceMin), 400);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [priceMin]);

	useEffect(() => {
		const current = searchParams.get("priceMax") ?? "";
		if (priceMax === current) return undefined;
		const timeout = setTimeout(() => updateParam("priceMax", priceMax), 400);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [priceMax]);

	const hasFilters = ["city", "district", "propertyType", "zoneType", "agentId", "priceMin", "priceMax"].some((key) =>
		searchParams.get(key),
	);

	function clearFilters() {
		setPriceMin("");
		setPriceMax("");
		router.replace(pathname);
	}

	return (
		<div className="mb-4 rounded-xl border border-theme-gold-light bg-white p-4 dark:border-[#333] dark:bg-[#1a1a1a]">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
				<select
					value={searchParams.get("city") ?? ""}
					onChange={(event) => updateParam("city", event.target.value)}
					className={SELECT_CLASSES}
				>
					<option value="">All cities</option>
					{cities.map((city) => (
						<option key={city} value={city}>
							{city}
						</option>
					))}
				</select>

				<select
					value={searchParams.get("district") ?? ""}
					onChange={(event) => updateParam("district", event.target.value)}
					className={SELECT_CLASSES}
				>
					<option value="">All districts</option>
					{districts.map((district) => (
						<option key={district} value={district}>
							{district}
						</option>
					))}
				</select>

				<select
					value={searchParams.get("propertyType") ?? ""}
					onChange={(event) => updateParam("propertyType", event.target.value)}
					className={SELECT_CLASSES}
				>
					<option value="">All types</option>
					{PROPERTY_TYPES.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>

				<select
					value={searchParams.get("zoneType") ?? ""}
					onChange={(event) => updateParam("zoneType", event.target.value)}
					className={SELECT_CLASSES}
				>
					<option value="">All zone types</option>
					{zoneTypes.map((zoneType) => (
						<option key={zoneType} value={zoneType}>
							{zoneType}
						</option>
					))}
				</select>

				{showAgentFilter ? (
					<select
						value={searchParams.get("agentId") ?? ""}
						onChange={(event) => updateParam("agentId", event.target.value)}
						className={SELECT_CLASSES}
					>
						<option value="">All agents</option>
						{agents.map((agent) => (
							<option key={agent.id} value={agent.id}>
								{agent.full_name || agent.email}
							</option>
						))}
					</select>
				) : null}

				<input
					type="number"
					min="0"
					placeholder="Min price"
					value={priceMin}
					onChange={(event) => setPriceMin(event.target.value)}
					className={SELECT_CLASSES}
				/>
				<input
					type="number"
					min="0"
					placeholder="Max price"
					value={priceMax}
					onChange={(event) => setPriceMax(event.target.value)}
					className={SELECT_CLASSES}
				/>
			</div>

			{hasFilters ? (
				<button
					type="button"
					onClick={clearFilters}
					className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-theme-blue hover:underline dark:text-theme-gold"
				>
					<X className="h-3.5 w-3.5" aria-hidden="true" />
					Clear filters
				</button>
			) : null}
		</div>
	);
}
