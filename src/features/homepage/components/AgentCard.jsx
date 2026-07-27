import Image from "next/image";
import Link from "next/link";
import { getAvatarForSeed } from "@/features/homepage/data";
import ContactAgentButton from "./ContactAgentButton";

export default function AgentCard({ agent, searchContext }) {
	const firstName = agent.name.split(" ")[0];

	return (
		<li className="flex flex-col rounded-2xl border border-theme-gray/15 bg-white/95 p-4 shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
			<Link href={`/agents/${agent.id}`} className="flex items-center gap-3">
				<div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full">
					<Image
						src={agent.avatarUrl || getAvatarForSeed(agent.id)}
						alt={agent.name}
						fill
						sizes="52px"
						className="object-cover"
					/>
				</div>
				<div className="min-w-0">
					<p className="truncate font-semibold text-theme-blue hover:underline dark:text-white">{agent.name}</p>
					<p className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">
						{agent.listingsCount} matching listing{agent.listingsCount === 1 ? "" : "s"}
					</p>
				</div>
			</Link>
			{agent.bio ? (
				<p className="mt-3 line-clamp-2 text-xs text-txt-secondary dark:text-txt-secondary-dark">{agent.bio}</p>
			) : null}
			<div className="mt-4 flex gap-2">
				<ContactAgentButton
					href={`mailto:${agent.email}?subject=ConeyRealty%20enquiry`}
					agentId={agent.id}
					method="email"
					searchContext={searchContext}
					variant="primary"
					className="flex-1 px-3 py-2 text-xs"
				>
					Email {firstName}
				</ContactAgentButton>
				{agent.phone ? (
					<ContactAgentButton
						href={`tel:${agent.phone}`}
						agentId={agent.id}
						method="call"
						searchContext={searchContext}
						variant="ghost"
						className="px-3 py-2 text-xs"
					>
						Call
					</ContactAgentButton>
				) : null}
			</div>
		</li>
	);
}
