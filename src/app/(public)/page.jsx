import HeroSearch from "@/features/homepage/components/HeroSearch";
import FeaturedHomes from "@/features/homepage/components/FeaturedHomes";
import Leaderboard from "@/features/homepage/components/Leaderboard";
import Testimonial from "@/features/homepage/components/Testimonial";
import BlogInsights from "@/features/homepage/components/BlogInsights";
import CTASection from "@/features/homepage/components/CTASection";

export default function HomePage() {
	return (
		<>
			<HeroSearch />
			<FeaturedHomes />
			<Leaderboard />
			<Testimonial />
			<BlogInsights />
			<CTASection />
		</>
	);
}
