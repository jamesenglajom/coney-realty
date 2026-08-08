"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Undo2, Redo2 } from "lucide-react";

const TOOLBAR_BUTTON_CLASSES =
	"inline-flex h-8 w-8 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-theme-gold-light hover:text-theme-blue disabled:opacity-40 disabled:pointer-events-none dark:text-txt-secondary-dark dark:hover:bg-white/10 dark:hover:text-white";
const TOOLBAR_BUTTON_ACTIVE_CLASSES = "bg-theme-gold-light text-theme-blue dark:bg-white/10 dark:text-theme-gold";

function ToolbarButton({ onClick, active, disabled, label, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-pressed={active}
			className={`${TOOLBAR_BUTTON_CLASSES} ${active ? TOOLBAR_BUTTON_ACTIVE_CLASSES : ""}`}
		>
			{children}
		</button>
	);
}

// WYSIWYG description editor for the property form's "Description" field —
// TipTap outputs clean HTML, stored as-is in properties.html_body and
// rendered on the public property detail page. Safe to render as raw HTML
// there since only trusted admin/agent roles can write it (see PropertyForm
// permission gating), never public input.
export default function HtmlBodyEditor({ value, onChange }) {
	const editor = useEditor({
		extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true })],
		content: value || "",
		// Next.js renders on the server first — TipTap's own DOM-based render
		// would otherwise produce a client/server markup mismatch on hydration.
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"min-h-[200px] max-w-none px-3.5 py-2.5 text-sm text-txt-primary outline-none dark:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-theme-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-theme-blue [&_a]:underline dark:[&_a]:text-theme-gold",
			},
		},
		onUpdate: ({ editor: current }) => onChange(current.getHTML()),
	});

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("Link URL", previousUrl || "https://");
		if (url === null) return;
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	}

	if (!editor) {
		return (
			<div className="min-h-[240px] animate-pulse rounded-xl border border-theme-gray/30 bg-theme-gray/5 dark:border-white/15 dark:bg-white/5" />
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-theme-gray/30 bg-white focus-within:border-theme-blue dark:border-white/15 dark:bg-white/5 dark:focus-within:border-theme-gold">
			<div className="flex flex-wrap items-center gap-1 border-b border-theme-gray/20 p-1.5 dark:border-white/10">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					active={editor.isActive("bold")}
					label="Bold"
				>
					<Bold className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					active={editor.isActive("italic")}
					label="Italic"
				>
					<Italic className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					active={editor.isActive("heading", { level: 2 })}
					label="Heading 2"
				>
					<Heading2 className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					active={editor.isActive("heading", { level: 3 })}
					label="Heading 3"
				>
					<Heading3 className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					active={editor.isActive("bulletList")}
					label="Bullet list"
				>
					<List className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					active={editor.isActive("orderedList")}
					label="Numbered list"
				>
					<ListOrdered className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					active={editor.isActive("blockquote")}
					label="Quote"
				>
					<Quote className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Link">
					<Link2 className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<div className="mx-1 h-5 w-px bg-theme-gray/20 dark:bg-white/10" />
				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					label="Undo"
				>
					<Undo2 className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					label="Redo"
				>
					<Redo2 className="h-4 w-4" aria-hidden="true" />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
}
