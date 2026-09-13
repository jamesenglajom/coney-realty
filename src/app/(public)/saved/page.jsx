import { getCurrentUser } from "@/features/auth/permissions";
import SectionHeading from "@/features/homepage/components/ui/SectionHeading";
import SavedPropertiesClient from "@/features/bookmarks/components/SavedPropertiesClient";

export const metadata = {
	title: "Saved Properties",
	description: "Properties you've bookmarked while browsing.",
};

// The list itself is entirely client-rendered (see SavedPropertiesClient —
// it only exists in this browser's localStorage, a Server Component can't
// see it), so this shell just supplies the page chrome/metadata plus
// whoever's signed in (currentUser.id, if anyone) — passed through so each
// card's Share button can carry their referral id, same as PLP/PDP.
export default async function SavedPropertiesPage() {
	const currentUser = await getCurrentUser();

	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<SectionHeading
					eyebrow="Your list"
					title="Saved properties"
					description="Listings you've bookmarked on this device — sold or taken down since? You'll still see its latest status here."
				/>
				<SavedPropertiesClient agentId={currentUser?.id} />
			</div>
		</section>
	);
}
