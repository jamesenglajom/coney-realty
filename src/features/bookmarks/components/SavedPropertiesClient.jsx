"use client";

import { useEffect, useState } from "react";
import { useBookmarkedIds } from "../useBookmarkedIds";
import { getBookmarkedPropertiesAction } from "../actions";
import PropertyCard from "@/features/homepage/components/PropertyCard";

// Entirely client-rendered (no Server Component shell can know the list —
// it only exists in this browser's localStorage) — reads the ids on mount,
// then fetches each property's *current* data fresh every time this page
// loads, so a bookmarked property that's since sold or changed price never
// shows stale info.
export default function SavedPropertiesClient({ agentId }) {
	const ids = useBookmarkedIds();
	const [properties, setProperties] = useState(null);

	useEffect(() => {
		if (ids.length === 0) {
			setProperties([]);
			return;
		}

		let cancelled = false;
		getBookmarkedPropertiesAction(ids).then((result) => {
			if (!cancelled) setProperties(result.properties);
		});

		return () => {
			cancelled = true;
		};
	}, [ids]);

	if (properties === null) {
		return <p className="mt-16 text-center text-sm text-txt-muted dark:text-txt-muted-dark">Loading your saved properties…</p>;
	}

	if (properties.length === 0) {
		return (
			<p className="mt-16 text-center text-sm text-txt-muted dark:text-txt-muted-dark">
				Nothing saved yet — tap the heart on any listing to keep it here.
			</p>
		);
	}

	return (
		<ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{properties.map((property) => (
				<PropertyCard key={property.id} property={property} agentId={agentId} />
			))}
		</ul>
	);
}
