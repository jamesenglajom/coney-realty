// Replaces the copy-pasted `<div className="mb-6 flex items-center
// justify-between">` header block every list page hand-rolled — same visual
// output, one component. `actions` is a right-aligned slot for page-level
// buttons (e.g. "New user", "Import spreadsheet" + "New property").
export default function PageHeader({ title, description, actions }) {
	return (
		<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 className="text-2xl font-bold text-theme-blue dark:text-white">{title}</h1>
				{description ? <p className="text-txt-secondary dark:text-txt-secondary-dark">{description}</p> : null}
			</div>
			{actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
		</div>
	);
}
