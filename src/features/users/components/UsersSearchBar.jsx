"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function UsersSearchBar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [value, setValue] = useState(searchParams.get("q") ?? "");

	// URL-driven per project convention — debounced so the route doesn't
	// update on every keystroke, but the search term still lives in the URL
	// (bookmarkable/shareable, survives a refresh).
	useEffect(() => {
		const current = searchParams.get("q") ?? "";
		if (value === current) return undefined;

		const timeout = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (value) params.set("q", value);
			else params.delete("q");
			router.replace(`${pathname}?${params.toString()}`);
		}, 300);

		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	return (
		<div className="relative max-w-sm">
			<Search
				className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-muted dark:text-txt-muted-dark"
				aria-hidden="true"
			/>
			<input
				type="text"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder="Search by name or email…"
				className="w-full rounded-xl border border-theme-gray/30 bg-white py-2.5 pl-9 pr-3.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold"
			/>
		</div>
	);
}
