import Card from "@/components/ui/Card";

export default function ChartPanel({ title, children }) {
	return (
		<Card className="p-6">
			<h3 className="mb-6 text-sm font-semibold text-theme-blue dark:text-white">{title}</h3>
			{children}
		</Card>
	);
}
