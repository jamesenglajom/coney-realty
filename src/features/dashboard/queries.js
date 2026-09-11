import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROPERTY_TYPES, PROPERTY_STATUSES } from "@/features/properties/schemas";
import { USER_ROLES } from "@/features/users/schemas";

function emptyCountMap(keys) {
	return Object.fromEntries(keys.map((key) => [key, 0]));
}

// Everything the SAdmin/Admin dashboard needs in one pass: property counts by
// status/type, sold volume (lifetime + last 6 months), and user counts by
// role. Single pair of queries rather than one round-trip per stat.
export async function getAdminDashboardStats() {
	const supabase = createAdminClient();

	const [{ data: properties, error: propertiesError }, { data: users, error: usersError }] = await Promise.all([
		supabase.from("properties").select("id, price, status, property_type, sold_at, created_at").is("deleted_at", null),
		supabase.from("users").select("id, role, created_at").is("deleted_at", null),
	]);

	if (propertiesError) throw new Error(propertiesError.message);
	if (usersError) throw new Error(usersError.message);

	const byStatus = emptyCountMap(PROPERTY_STATUSES);
	const byType = emptyCountMap(PROPERTY_TYPES);
	let lifetimeSoldCount = 0;
	let lifetimeSoldVolume = 0;

	const now = new Date();
	const months = Array.from({ length: 6 }, (_, index) => {
		const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
		return {
			key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
			label: monthDate.toLocaleDateString("en-US", { month: "short" }),
			count: 0,
			volume: 0,
		};
	});
	const monthIndexByKey = new Map(months.map((month, index) => [month.key, index]));

	// "New this month" counts for the KPI tiles' sparklines below — a
	// separate pass from `months` above (which counts sold deals, already
	// used by the existing "Sales trend" chart) since these track when a
	// property/user was *created*, not sold.
	const newPropertiesByMonth = months.map((month) => ({ ...month, count: 0 }));
	const newPublishedByMonth = months.map((month) => ({ ...month, count: 0 }));
	const newUsersByMonth = months.map((month) => ({ ...month, count: 0 }));

	function bucketByCreatedAt(createdAt, series) {
		if (!createdAt) return;
		const date = new Date(createdAt);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		const monthIndex = monthIndexByKey.get(key);
		if (monthIndex !== undefined) series[monthIndex].count += 1;
	}

	for (const property of properties ?? []) {
		if (byStatus[property.status] !== undefined) byStatus[property.status] += 1;
		if (byType[property.property_type] !== undefined) byType[property.property_type] += 1;

		bucketByCreatedAt(property.created_at, newPropertiesByMonth);
		if (property.status === "published") bucketByCreatedAt(property.created_at, newPublishedByMonth);

		if (property.status === "sold") {
			const price = Number(property.price) || 0;
			lifetimeSoldCount += 1;
			lifetimeSoldVolume += price;

			if (property.sold_at) {
				const soldDate = new Date(property.sold_at);
				const key = `${soldDate.getFullYear()}-${soldDate.getMonth()}`;
				const monthIndex = monthIndexByKey.get(key);
				if (monthIndex !== undefined) {
					months[monthIndex].count += 1;
					months[monthIndex].volume += price;
				}
			}
		}
	}

	const byRole = emptyCountMap(USER_ROLES);
	for (const user of users ?? []) {
		if (byRole[user.role] !== undefined) byRole[user.role] += 1;
		bucketByCreatedAt(user.created_at, newUsersByMonth);
	}

	// Running totals rather than raw monthly counts — this data set was
	// bulk-imported (nearly everything created in one or two months), so a
	// "new this month" chart would mostly read as a single spike surrounded
	// by zeros. A cumulative total is honest about the same underlying
	// numbers (nothing invented) while actually reading as a trend.
	function toCumulative(series) {
		let running = 0;
		return series.map((month) => {
			running += month.count;
			return { ...month, count: running };
		});
	}

	return {
		totalProperties: properties?.length ?? 0,
		totalUsers: users?.length ?? 0,
		byStatus,
		byType,
		byRole,
		lifetime: { count: lifetimeSoldCount, volume: lifetimeSoldVolume },
		monthlyTrend: months,
		propertiesTrend: toCumulative(newPropertiesByMonth),
		publishedTrend: toCumulative(newPublishedByMonth),
		usersTrend: toCumulative(newUsersByMonth),
		soldTrend: toCumulative(months.map((month) => ({ label: month.label, count: month.count }))),
	};
}

// Ranks agents by how many properties are currently assigned to them —
// a simple magnitude comparison across entities, not an identity breakdown.
export async function getTopAgentsByListings(limit = 5) {
	const supabase = createAdminClient();
	const { data, error } = await supabase.from("user_property").select("user_id, users(id, full_name, email)");

	if (error) throw new Error(error.message);

	const counts = new Map();
	for (const row of data ?? []) {
		const user = row.users;
		if (!user) continue;
		const existing = counts.get(user.id);
		if (existing) existing.count += 1;
		else counts.set(user.id, { id: user.id, name: user.full_name || user.email, count: 1 });
	}

	return Array.from(counts.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, limit);
}
