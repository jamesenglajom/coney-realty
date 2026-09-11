import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/features/auth/permissions";
import { getUserById } from "@/features/users/queries";
import { listProperties, getAgentPropertyStats } from "@/features/properties/queries";
import { PROPERTY_STATUS_LABELS } from "@/features/properties/schemas";
import { getAvatarForSeed } from "@/features/homepage/data";
import Badge from "@/components/ui/Badge";

// Same role palette as the Users table — kept as its own local copy rather
// than a shared export, matching how the property preview page keeps its own
// STATUS_BADGE_CLASSES separate from the properties table's.
const ROLE_BADGE_CLASSES = {
	SAdmin: "bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue",
	Admin: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
	Manager: "bg-theme-gray/20 text-txt-secondary dark:text-txt-secondary-dark",
	Agent: "bg-theme-gray/10 text-txt-muted dark:text-txt-muted-dark",
};

const STATUS_BADGE_CLASSES = {
	draft: "bg-chart-status-draft/15 text-chart-status-draft dark:bg-chart-status-draft-dark/20 dark:text-chart-status-draft-dark",
	published:
		"bg-chart-status-published/15 text-chart-status-published dark:bg-chart-status-published-dark/20 dark:text-chart-status-published-dark",
	on_hold:
		"bg-chart-status-onhold/15 text-chart-status-onhold dark:bg-chart-status-onhold-dark/20 dark:text-chart-status-onhold-dark",
	sold: "bg-chart-status-sold/20 text-chart-status-sold dark:bg-chart-status-sold-dark/20 dark:text-chart-status-sold-dark",
	archived:
		"bg-chart-status-archived/15 text-chart-status-archived dark:bg-chart-status-archived-dark/20 dark:text-chart-status-archived-dark",
};

const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "long" });
const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

export async function generateMetadata({ params }) {
	const { id } = await params;
	const user = await getUserById(id);
	if (!user) return {};
	return { title: user.full_name || user.email };
}

export default async function UserPreviewPage({ params }) {
	const { id } = await params;
	await requirePermission("users", "view");
	const user = await getUserById(id);

	if (!user) notFound();

	const photo = user.avatarUrl || getAvatarForSeed(user.id);

	const isAgent = user.role === "Agent";
	const [assignedProperties, stats] = isAgent
		? await Promise.all([listProperties({ agentId: user.id }), getAgentPropertyStats(user.id)])
		: [[], null];

	return (
		<div className="max-w-3xl">
			<Link
				href="/admin/users"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back to users
			</Link>

			<div className="mt-6 flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-center gap-4">
					<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-theme-gold-light dark:ring-border-dark">
						<Image src={photo} alt={user.full_name || user.email} fill sizes="64px" className="object-cover object-top" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-theme-blue dark:text-white">{user.full_name || "—"}</h1>
						<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{user.email}</p>
					</div>
				</div>
				<Badge className={`px-3 py-1 ${ROLE_BADGE_CLASSES[user.role]}`}>{user.role}</Badge>
			</div>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				<div className="rounded-2xl border border-theme-gold-light/70 p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Email</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">{user.email}</p>
				</div>
				<div className="rounded-2xl border border-theme-gold-light/70 p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Phone</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">{user.phone || "—"}</p>
				</div>
				<div className="rounded-2xl border border-theme-gold-light/70 p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Role</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">{user.role}</p>
				</div>
				<div className="rounded-2xl border border-theme-gold-light/70 p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Joined</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{user.created_at ? dateFormatter.format(new Date(user.created_at)) : "—"}
					</p>
				</div>
			</div>

			{user.bio ? (
				<div className="mt-8">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Bio</h2>
					<p className="mt-2 text-sm text-txt-secondary dark:text-txt-secondary-dark">{user.bio}</p>
				</div>
			) : null}

			{isAgent ? (
				<div className="mt-8">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Assigned properties
					</h2>

					{stats ? (
						<dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="rounded-2xl border border-theme-gold-light/70 p-3 dark:border-border-dark">
								<dt className="text-xs text-txt-muted dark:text-txt-muted-dark">Total assigned</dt>
								<dd className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">{stats.totalAssigned}</dd>
							</div>
							<div className="rounded-2xl border border-theme-gold-light/70 p-3 dark:border-border-dark">
								<dt className="text-xs text-txt-muted dark:text-txt-muted-dark">Sold (lifetime)</dt>
								<dd className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">
									{stats.lifetime.count}
								</dd>
							</div>
							<div className="rounded-2xl border border-theme-gold-light/70 p-3 dark:border-border-dark">
								<dt className="text-xs text-txt-muted dark:text-txt-muted-dark">Sold (this month)</dt>
								<dd className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">{stats.thisMonth.count}</dd>
							</div>
							<div className="rounded-2xl border border-theme-gold-light/70 p-3 dark:border-border-dark">
								<dt className="text-xs text-txt-muted dark:text-txt-muted-dark">Lifetime volume</dt>
								<dd className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">
									{priceFormatter.format(stats.lifetime.volume)}
								</dd>
							</div>
						</dl>
					) : null}

					{assignedProperties.length === 0 ? (
						<p className="mt-3 text-sm text-txt-muted dark:text-txt-muted-dark">No properties assigned yet.</p>
					) : (
						<ul className="mt-3 divide-y divide-theme-gold-light rounded-2xl border border-theme-gold-light/70 dark:divide-border-dark dark:border-border-dark">
							{assignedProperties.map((property) => (
								<li key={property.id} className="flex items-center justify-between gap-3 p-3">
									<Link
										href={`/admin/property/${property.slug}`}
										className="truncate text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
									>
										{property.screen_name || property.title}
									</Link>
									<Badge className={`shrink-0 px-2 py-0.5 text-xs capitalize ${STATUS_BADGE_CLASSES[property.status]}`}>
										{PROPERTY_STATUS_LABELS[property.status] || property.status}
									</Badge>
								</li>
							))}
						</ul>
					)}
				</div>
			) : null}
		</div>
	);
}
