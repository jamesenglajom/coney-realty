import { matchListedAgents } from "@/features/homepage/queries";
import AgentCard from "./AgentCard";

export default async function AgentResults({ location, type, price }) {
	const matches = await matchListedAgents({ location, type, price });

	if (matches.length === 0) {
		return (
			<div className="rounded-2xl border border-white/15 bg-white/10 p-6 text-sm text-white/80 backdrop-blur-md">
				No agents cover that mix yet. Try widening the budget or picking a nearby city — our team is expanding fast.
			</div>
		);
	}

	return (
		<div>
			<p className="mb-3 text-sm text-white/75">
				{matches.length} {matches.length === 1 ? "agent handles" : "agents handle"} homes matching your search.
				Reach out directly — no forms, no wait.
			</p>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{matches.map((agent) => (
					<AgentCard key={agent.id} agent={agent} searchContext={{ location, type, price }} />
				))}
			</ul>
		</div>
	);
}
