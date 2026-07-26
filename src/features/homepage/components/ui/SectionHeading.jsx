import Eyebrow from "./Eyebrow";

export default function SectionHeading({ eyebrow, title, description, tone = "default", className = "" }) {
	const titleClasses = tone === "on-dark" ? "text-white" : "text-theme-blue dark:text-white";
	const descriptionClasses = tone === "on-dark" ? "text-white/75" : "text-txt-secondary dark:text-txt-secondary-dark";

	return (
		<div className={className}>
			{eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
			<h2 className={`mt-3 font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.05] ${titleClasses}`}>
				{title}
			</h2>
			{description ? <p className={`mt-4 max-w-xl ${descriptionClasses}`}>{description}</p> : null}
		</div>
	);
}
