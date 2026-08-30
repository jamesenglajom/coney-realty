import { getPublicTestimonials } from "@/features/testimonials/queries";
import TestimonialCarouselClient from "./TestimonialCarouselClient";

export default async function TestimonialCarousel() {
	const testimonials = await getPublicTestimonials();

	if (testimonials.length === 0) return null;

	return <TestimonialCarouselClient testimonials={testimonials} />;
}
