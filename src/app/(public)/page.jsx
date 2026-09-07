import HeroSearch from "@/features/homepage/components/HeroSearch";
import FeaturedHomes from "@/features/homepage/components/FeaturedHomes";
// import Leaderboard from "@/features/homepage/components/Leaderboard";
import TopPerformersPanorama from "@/features/homepage/components/TopPerformersPanorama";
import TestimonialCarousel from "@/features/homepage/components/TestimonialCarousel";
import BlogInsights from "@/features/homepage/components/BlogInsights";
import CTASection from "@/features/homepage/components/CTASection";

export default function HomePage() {
	return (
		<>
			<HeroSearch />
			<FeaturedHomes />
			{/* Superseded by TopPerformersPanorama below (same backend-managed
			    leaderboard_config data, different treatment) — left commented
			    rather than deleted in case we want the poster look back. */}
			{/* <Leaderboard /> */}
			<TopPerformersPanorama />
			<TestimonialCarousel />
			<BlogInsights />
			<CTASection />
		</>
	);
}
