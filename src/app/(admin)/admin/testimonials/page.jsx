import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listTestimonials } from "@/features/testimonials/queries";
import { listUsers } from "@/features/users/queries";
import { getAgentPhotosById } from "@/features/users/imageFs";
import TestimonialEditor from "@/features/testimonials/components/TestimonialEditor";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Testimonials",
};

export default async function TestimonialsPage() {
	const user = await requirePermission("testimonials", "view");

	const [testimonials, permissions, users] = await Promise.all([
		listTestimonials(),
		getPagePermissions(user.role, "testimonials"),
		listUsers(),
	]);

	const agentOptions = users
		.filter((u) => u.role === "Agent")
		.map((u) => ({ id: u.id, name: u.full_name || u.email }));
	const agentPhotosById = getAgentPhotosById(agentOptions.map((agent) => agent.id));

	return (
		<div>
			<PageHeader
				title="Testimonials"
				description="Curate the homepage testimonial carousel — quotes, client names, and the agent behind each one."
			/>

			<TestimonialEditor
				testimonials={testimonials}
				agentOptions={agentOptions}
				agentPhotosById={agentPhotosById}
				canCreate={permissions.can_create}
				canEdit={permissions.can_edit}
				canDelete={permissions.can_delete}
			/>
		</div>
	);
}
