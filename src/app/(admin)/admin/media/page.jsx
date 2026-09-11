import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listMediaFolder } from "@/features/media/storage";
import { getMediaUrl, MEDIA_FOLDERS } from "@/features/media/publicUrls";
import MediaLibraryClient from "@/features/media/components/MediaLibraryClient";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Media",
};

const DEFAULT_FOLDER = MEDIA_FOLDERS[0];

export default async function MediaLibraryPage() {
	const user = await requirePermission("media", "view");
	const [permissions, files] = await Promise.all([
		getPagePermissions(user.role, "media"),
		listMediaFolder(DEFAULT_FOLDER),
	]);

	const initialFiles = files
		.map((file) => ({ name: file.name, url: getMediaUrl(`${DEFAULT_FOLDER}/${file.name}`), updatedAt: file.updated_at }))
		.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

	return (
		<div>
			<PageHeader
				title="Media"
				description="Upload and manage the photos used across properties, testimonials, and the leaderboard."
			/>
			<MediaLibraryClient
				initialFolder={DEFAULT_FOLDER}
				initialFiles={initialFiles}
				canUpload={permissions.can_create}
				canDelete={permissions.can_delete}
			/>
		</div>
	);
}
