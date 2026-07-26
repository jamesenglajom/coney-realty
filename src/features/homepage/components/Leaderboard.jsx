import Image from "next/image";
import { getLeaderboard } from "@/features/homepage/data";
import SectionHeading from "./ui/SectionHeading";

export default function Leaderboard() {
	const ranked = getLeaderboard(8);
	const [first, second, third, ...rest] = ranked;
	const podium = [
		{ agent: second, rank: 2 },
		{ agent: first, rank: 1 },
		{ agent: third, rank: 3 },
	];

	return (
		<section id="leaderboard" className="bg-theme-blue text-white">
			<div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
				<SectionHeading
					eyebrow="This quarter"
					title="The agents topping the board"
					description="Ranked by client rating and closings — the people you actually want in your corner."
					tone="on-dark"
					className="max-w-xl"
				/>

				<div className="mt-14 grid grid-cols-3 items-end gap-3 sm:gap-6">
					{podium.map(({ agent, rank }) => {
						const isLead = rank === 1;
						const size = isLead ? "h-28 w-28 sm:h-36 sm:w-36" : "h-20 w-20 sm:h-24 sm:w-24";

						return (
							<div key={agent.id} className="flex flex-col items-center text-center">
								<div className="relative">
									<div
										className={`relative overflow-hidden rounded-full ${size} ${isLead ? "ring-4 ring-theme-gold" : "ring-4 ring-white/30"}`}
									>
										<Image
											src={agent.photo}
											alt={agent.name}
											fill
											sizes="144px"
											className="object-cover"
										/>
									</div>
									<span
										className={`absolute -bottom-2 left-1/2 grid -translate-x-1/2 place-items-center rounded-full font-display font-semibold ${
											isLead ? "h-9 w-9 bg-theme-gold text-lg text-theme-blue" : "h-7 w-7 bg-white text-sm text-theme-blue"
										}`}
									>
										{rank}
									</span>
								</div>
								<p className={`mt-5 font-semibold ${isLead ? "text-lg" : ""}`}>{agent.name}</p>
								<p className="text-xs text-white/65">{agent.title}</p>
								<p className="mt-1 text-xs font-medium text-theme-gold">
									{agent.volume} · {agent.deals} deals
								</p>
							</div>
						);
					})}
				</div>

				<ol className="mt-14 grid gap-3 sm:grid-cols-2">
					{rest.map((agent, index) => (
						<li key={agent.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
							<span className="w-6 text-center font-display text-lg font-semibold text-white/50">{index + 4}</span>
							<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
								<Image src={agent.photo} alt={agent.name} fill sizes="44px" className="object-cover" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium">{agent.name}</p>
								<p className="truncate text-xs text-white/60">{agent.regions.join(" · ")}</p>
							</div>
							<div className="text-right">
								<p className="text-sm font-semibold text-theme-gold">{agent.rating.toFixed(1)}★</p>
								<p className="text-xs text-white/60">{agent.deals} deals</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
