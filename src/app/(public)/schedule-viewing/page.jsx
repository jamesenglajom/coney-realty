import { listPropertyOptionsForViewingForm } from "@/features/viewings/queries";
import ScheduleViewingForm from "@/features/viewings/components/ScheduleViewingForm";
import SectionHeading from "@/features/homepage/components/ui/SectionHeading";

export const metadata = {
	title: "Schedule a viewing",
	description: "Tell us which properties you'd like to visit and when — an agent will confirm a time with you.",
};

export default async function ScheduleViewingPage({ searchParams }) {
	const params = await searchParams;
	const requestedSlugs = Array.isArray(params.property) ? params.property : params.property ? [params.property] : [];

	const propertyOptions = await listPropertyOptionsForViewingForm();
	const preselectedIds = propertyOptions
		.filter((property) => requestedSlugs.includes(property.slug))
		.map((property) => property.id);

	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-3xl px-5 sm:px-8">
				<SectionHeading
					eyebrow="Schedule a viewing"
					title="Let's get you inside"
					description="Share your details and pick the properties you'd like to see — an agent will reach out to confirm a time."
				/>

				<div className="mt-10">
					<ScheduleViewingForm propertyOptions={propertyOptions} preselectedIds={preselectedIds} />
				</div>
			</div>
		</section>
	);
}
