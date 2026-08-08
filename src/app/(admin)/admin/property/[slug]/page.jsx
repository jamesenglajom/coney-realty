import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/features/auth/permissions";
import { getPropertyBySlug } from "@/features/properties/queries";
import Badge from "@/components/ui/Badge";

// Same chart-status-* tokens as the admin Properties table and dashboard
// chart, so a status means the same color everywhere.
const STATUS_BADGE_CLASSES = {
	draft: "bg-chart-status-draft/15 text-chart-status-draft dark:bg-chart-status-draft-dark/20 dark:text-chart-status-draft-dark",
	published:
		"bg-chart-status-published/15 text-chart-status-published dark:bg-chart-status-published-dark/20 dark:text-chart-status-published-dark",
	sold: "bg-chart-status-sold/20 text-chart-status-sold dark:bg-chart-status-sold-dark/20 dark:text-chart-status-sold-dark",
	archived:
		"bg-chart-status-archived/15 text-chart-status-archived dark:bg-chart-status-archived-dark/20 dark:text-chart-status-archived-dark",
};

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

function humanizeKey(key) {
	return key
		.replace(/_/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function CustomFieldValue({ value }) {
	if (isPlainObject(value)) {
		const entries = Object.entries(value).filter(([, v]) => v !== "" && v != null);
		if (entries.length === 0) return <span className="text-txt-muted dark:text-txt-muted-dark">—</span>;
		return (
			<dl className="space-y-1">
				{entries.map(([key, v]) => (
					<div key={key} className="flex gap-2 text-xs">
						<dt className="shrink-0 text-txt-muted dark:text-txt-muted-dark">{humanizeKey(key)}:</dt>
						<dd className="truncate">
							{typeof v === "string" && /^https?:\/\//.test(v) ? (
								<a href={v} target="_blank" rel="noreferrer" className="text-theme-blue underline dark:text-theme-gold">
									Link
								</a>
							) : (
								String(v)
							)}
						</dd>
					</div>
				))}
			</dl>
		);
	}

	if (typeof value === "string" && /^https?:\/\//.test(value)) {
		return (
			<a href={value} target="_blank" rel="noreferrer" className="text-theme-blue underline dark:text-theme-gold">
				{value}
			</a>
		);
	}

	return <span>{String(value)}</span>;
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const property = await getPropertyBySlug(slug);
	if (!property) return {};
	return { title: property.title };
}

export default async function PropertyPreviewPage({ params }) {
	const { slug } = await params;
	const user = await requirePermission("properties", "view");
	const property = await getPropertyBySlug(slug);

	if (!property) notFound();
	// Agents can only preview properties assigned to them — not found (not a
	// permission error) so an unassigned property's existence isn't leaked.
	if (user.role === "Agent" && !property.assignedUserIds.includes(user.id)) notFound();

	const location =
		property.city_state || [property.city, property.region, property.district].filter(Boolean).join(", ") || "—";

	const customFieldEntries = Object.entries(property.custom_fields ?? {}).filter(
		([, value]) => value !== "" && value != null,
	);

	return (
		<div className="max-w-3xl">
			<Link
				href="/admin/properties"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-blue hover:underline dark:text-theme-gold"
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back to properties
			</Link>

			{property.lat != null && property.lng != null ? (
				<div className="mt-6">
					<div className="overflow-hidden rounded-xl border border-theme-gold-light dark:border-border-dark">
						<iframe
							title="Property location map"
							src={`https://www.google.com/maps?q=${property.lat},${property.lng}&z=16&output=embed`}
							width="100%"
							height="360"
							style={{ border: 0 }}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
					<a
						href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
						target="_blank"
						rel="noreferrer"
						className="mt-2 inline-block text-xs font-medium text-theme-blue hover:underline dark:text-theme-gold"
					>
						Open in Google Maps →
					</a>
				</div>
			) : null}

			<div className="mt-6 flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">{property.title}</h1>
					<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{property.property_type}</p>
				</div>
				<Badge className={`px-3 py-1 capitalize ${STATUS_BADGE_CLASSES[property.status]}`}>{property.status}</Badge>
			</div>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				<div className="rounded-xl border border-theme-gold-light p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Price</p>
					<p className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">
						{property.price != null ? priceFormatter.format(property.price) : "Price on request"}
					</p>
				</div>
				<div className="rounded-xl border border-theme-gold-light p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Location</p>
					<p className="mt-1 text-lg font-semibold text-theme-blue dark:text-white">{location}</p>
				</div>
				<div className="rounded-xl border border-theme-gold-light p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Full address
					</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{property.address_line || "—"}
					</p>
				</div>
				<div className="rounded-xl border border-theme-gold-light p-4 dark:border-border-dark">
					<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Zone / Payment
					</p>
					<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{property.zone_type || "—"}
						{property.payment_type ? ` · ${property.payment_type}` : ""}
					</p>
					{property.payment_terms ? (
						<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">{property.payment_terms}</p>
					) : null}
				</div>
			</div>

			{property.html_body ? (
				<div className="mt-8">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Description
					</h2>
					<div
						className="mt-2 max-w-none text-sm text-txt-secondary dark:text-txt-secondary-dark [&_a]:text-theme-blue [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-theme-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_a]:text-theme-gold"
						dangerouslySetInnerHTML={{ __html: property.html_body }}
					/>
				</div>
			) : null}

			{property.assignedAgents.length > 0 ? (
				<div className="mt-8">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Assigned agents
					</h2>
					<ul className="mt-2 flex flex-wrap gap-2">
						{property.assignedAgents.map((agent) => (
							<li
								key={agent.id}
								className="rounded-full bg-theme-gold-light px-3 py-1 text-xs font-medium text-theme-blue dark:bg-white/10 dark:text-theme-gold"
							>
								{agent.full_name || agent.email}
							</li>
						))}
					</ul>
				</div>
			) : null}

			{customFieldEntries.length > 0 ? (
				<div className="mt-8">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
						Additional details
					</h2>
					<dl className="mt-3 grid gap-3 sm:grid-cols-2">
						{customFieldEntries.map(([key, value]) => (
							<div key={key} className="rounded-xl border border-theme-gold-light p-3 dark:border-border-dark">
								<dt className="text-xs font-semibold text-txt-muted dark:text-txt-muted-dark">{humanizeKey(key)}</dt>
								<dd className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">
									<CustomFieldValue value={value} />
								</dd>
							</div>
						))}
					</dl>
				</div>
			) : null}
		</div>
	);
}
