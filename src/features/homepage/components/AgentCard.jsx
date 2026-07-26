import Image from "next/image";
import { getAvatarForSeed } from "@/features/homepage/data";
import Button from "@/components/ui/Button";

export default function AgentCard({ agent }) {
	const firstName = agent.name.split(" ")[0];

	return (
		<li className="flex flex-col rounded-2xl border border-theme-gray/15 bg-white/95 p-4 shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
			<div className="flex items-center gap-3">
				<div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full">
					<Image src={getAvatarForSeed(agent.id)} alt={agent.name} fill sizes="52px" className="object-cover" />
				</div>
				<div className="min-w-0">
					<p className="truncate font-semibold text-theme-blue dark:text-white">{agent.name}</p>
					<p className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">
						{agent.listingsCount} matching listing{agent.listingsCount === 1 ? "" : "s"}
					</p>
				</div>
			</div>
			<div className="mt-4">
				<Button href={`mailto:${agent.email}?subject=ConeyRealty%20enquiry`} variant="primary" className="w-full px-3 py-2 text-xs">
					Email {firstName}
				</Button>
			</div>
		</li>
	);
}
