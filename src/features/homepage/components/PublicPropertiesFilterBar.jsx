import Link from "next/link";
import { PRICE_BANDS } from "@/features/homepage/data";
import { PROPERTY_TYPES } from "@/features/properties/schemas";

const FIELD_CLASSES =
	"w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold";
const LABEL_CLASSES = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-txt-muted dark:text-txt-muted-dark";

// A plain GET form — no client JS needed. Submitting it replaces the query
// string outright (native browser behavior), which conveniently also resets
// pagination to page 1 whenever a filter changes, since there's no hidden
// `page` field carried along.
export default function PublicPropertiesFilterBar({ cities, city, propertyType, price }) {
	const hasFilters = Boolean(city || propertyType || price);

	return (
		<form
			method="get"
			className="grid gap-3 rounded-2xl border border-theme-gray/15 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3 sm:items-end lg:grid-cols-[1fr_1fr_1fr_auto]"
		>
			<div>
				<label htmlFor="city" className={LABEL_CLASSES}>
					Location
				</label>
				<select id="city" name="city" defaultValue={city ?? ""} className={FIELD_CLASSES}>
					<option value="">Anywhere</option>
					{cities.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
			</div>
			<div>
				<label htmlFor="propertyType" className={LABEL_CLASSES}>
					Property type
				</label>
				<select id="propertyType" name="propertyType" defaultValue={propertyType ?? ""} className={FIELD_CLASSES}>
					<option value="">Any type</option>
					{PROPERTY_TYPES.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
			<div>
				<label htmlFor="price" className={LABEL_CLASSES}>
					Budget
				</label>
				<select id="price" name="price" defaultValue={price ?? ""} className={FIELD_CLASSES}>
					{PRICE_BANDS.map((band, index) => (
						<option key={band.label} value={index}>
							{band.label}
						</option>
					))}
				</select>
			</div>
			<div className="flex gap-2">
				<button
					type="submit"
					className="inline-flex h-[42px] flex-1 items-center justify-center rounded-xl bg-theme-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-theme-blue/90 dark:bg-theme-gold dark:text-theme-blue dark:hover:bg-theme-gold/90"
				>
					Filter
				</button>
				{hasFilters ? (
					<Link
						href="/properties"
						className="inline-flex h-[42px] items-center justify-center rounded-xl border border-theme-gray/30 px-4 text-sm font-medium text-txt-secondary transition-colors hover:border-theme-gray/60 dark:border-white/20 dark:text-txt-secondary-dark dark:hover:border-white/40"
					>
						Clear
					</Link>
				) : null}
			</div>
		</form>
	);
}
