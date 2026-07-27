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
		supabase.from("properties").select("id, price, status, property_type, sold_at").is("deleted_at", null),
		supabase.from("users").select("id, role").is("deleted_at", null),
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

	for (const property of properties ?? []) {
		if (byStatus[property.status] !== undefined) byStatus[property.status] += 1;
		if (byType[property.property_type] !== undefined) byType[property.property_type] += 1;

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
	}

	return {
		totalProperties: properties?.length ?? 0,
		totalUsers: users?.length ?? 0,
		byStatus,
		byType,
		byRole,
		lifetime: { count: lifetimeSoldCount, volume: lifetimeSoldVolume },
		monthlyTrend: months,
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
