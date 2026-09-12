import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listMediaAction } from "@/features/media/actions";
import { MEDIA_FOLDERS } from "@/features/media/publicUrls";
import MediaLibraryClient from "@/features/media/components/MediaLibraryClient";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Media",
};

const PAGE_SIZE = 24;

export default async function MediaLibraryPage({ searchParams }) {
	const params = await searchParams;
	const user = await requirePermission("media", "view");
	const folder = MEDIA_FOLDERS.includes(params.folder) ? params.folder : MEDIA_FOLDERS[0];
	const page = Math.max(1, Number(params.page) || 1);

	const [permissions, { files, totalCount }] = await Promise.all([
		getPagePermissions(user.role, "media"),
		listMediaAction(folder, { page, pageSize: PAGE_SIZE }),
	]);

	return (
		<div>
			<PageHeader
				title="Media"
				description="Upload and manage the photos used across properties, testimonials, and the leaderboard."
			/>
			<MediaLibraryClient
				folder={folder}
				page={page}
				pageSize={PAGE_SIZE}
				totalCount={totalCount}
				initialFiles={files}
				canUpload={permissions.can_create}
				canDelete={permissions.can_delete}
			/>
		</div>
	);
}
