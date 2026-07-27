import Image from "next/image";
import { TESTIMONIAL } from "@/features/homepage/data";
import { getAgentByEmail } from "@/features/homepage/queries";

export default async function Testimonial() {
	const agent = await getAgentByEmail(TESTIMONIAL.email);
	const name = agent?.name || TESTIMONIAL.name;
	const avatarUrl = agent?.avatarUrl ?? null;

	return (
		<section
			aria-label="Agent testimonial"
			className="border-y border-theme-gray/15 bg-theme-gold-light/40 dark:border-white/10 dark:bg-white/[0.02]"
		>
			<div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[auto_1fr] md:items-center">
				<div className="relative mx-auto h-56 w-56 shrink-0 overflow-hidden rounded-[32px] bg-theme-gold">
					{avatarUrl ? (
						<Image src={avatarUrl} alt={name} fill sizes="224px" className="object-cover" />
					) : (
						<span className="flex h-full w-full items-center justify-center font-display text-8xl font-semibold text-theme-blue">
							{name.trim()[0]?.toUpperCase() ?? "?"}
						</span>
					)}
				</div>
				<figure className="m-0">
					<span className="font-display text-6xl leading-none text-theme-gold" aria-hidden="true">
						&ldquo;
					</span>
					<blockquote className="mt-2 font-display text-[clamp(22px,3.5vw,30px)] font-medium leading-tight text-theme-blue dark:text-white">
						{TESTIMONIAL.quote}
					</blockquote>
					<figcaption className="mt-6 text-sm">
						<span className="font-semibold text-theme-blue dark:text-white">{name}</span>
						<span className="text-txt-muted dark:text-txt-muted-dark"> — {TESTIMONIAL.role}</span>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
