import Card from "@/components/ui/Card";

// Shared dashboard stat tile — previously duplicated as a file-private
// component in AdminDashboard.jsx and hand-copied 4x inline in the Agent
// dashboard (admin/page.jsx) since there was nothing shared to import.
export default function KpiTile({ label, value, sublabel }) {
	return (
		<Card className="p-6">
			<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">{label}</p>
			<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{value}</h3>
			{sublabel ? <p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">{sublabel}</p> : null}
		</Card>
	);
}
