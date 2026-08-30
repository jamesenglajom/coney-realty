import HeroSearch from "@/features/homepage/components/HeroSearch";
import FeaturedHomes from "@/features/homepage/components/FeaturedHomes";
import Leaderboard from "@/features/homepage/components/Leaderboard";
import TestimonialCarousel from "@/features/homepage/components/TestimonialCarousel";
import BlogInsights from "@/features/homepage/components/BlogInsights";
import CTASection from "@/features/homepage/components/CTASection";

export default function HomePage() {
	return (
		<>
			<HeroSearch />
			<FeaturedHomes />
			<Leaderboard />
			<TestimonialCarousel />
			<BlogInsights />
			<CTASection />
		</>
	);
}
