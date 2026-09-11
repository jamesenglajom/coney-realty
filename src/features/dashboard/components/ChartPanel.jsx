import Card from "@/components/ui/Card";

export default function ChartPanel({ title, children }) {
	return (
		<Card className="p-6">
			<h3 className="mb-6 text-[13.5px] font-bold tracking-tight text-theme-blue dark:text-white">{title}</h3>
			{children}
		</Card>
	);
}
