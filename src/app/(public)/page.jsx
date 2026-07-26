import HeroSearch from "@/features/homepage/components/HeroSearch";
import StatsBand from "@/features/homepage/components/StatsBand";
import FeaturedHomes from "@/features/homepage/components/FeaturedHomes";
import Leaderboard from "@/features/homepage/components/Leaderboard";
import Testimonial from "@/features/homepage/components/Testimonial";
import BlogInsights from "@/features/homepage/components/BlogInsights";
import CTASection from "@/features/homepage/components/CTASection";

export default async function HomePage({ searchParams }) {
	const resolvedSearchParams = await searchParams;

	return (
		<>
			<HeroSearch searchParams={resolvedSearchParams} />
			<StatsBand />
			<FeaturedHomes />
			<Leaderboard />
			<Testimonial />
			<BlogInsights />
			<CTASection />
		</>
	);
}
