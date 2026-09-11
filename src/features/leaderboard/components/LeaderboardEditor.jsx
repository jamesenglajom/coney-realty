"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAvatarForSeed } from "@/features/homepage/data";
import Button from "@/components/ui/Button";
import LeaderboardEntryModal from "./LeaderboardEntryModal";
import { deleteLeaderboardEntryAction, reorderLeaderboardAction } from "../actions";

function photoFor(entry) {
	return entry.photoUrl || entry.agentAvatarUrl || getAvatarForSeed(entry.id);
}

function SortableRow({ entry, rank, canEdit, canDelete, onEdit, onDelete }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 rounded-xl border border-theme-gold-light bg-white p-3 dark:border-border-dark dark:bg-surface-dark"
		>
			<button
				type="button"
				className="cursor-grab touch-none text-txt-muted hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:text-txt-secondary-dark"
				aria-label={`Reorder ${entry.name}`}
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-5 w-5" aria-hidden="true" />
			</button>

			<span className="w-6 text-center font-display text-lg font-semibold text-theme-blue dark:text-white">{rank}</span>

			<span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-theme-gray/10 dark:bg-white/5">
				<Image src={photoFor(entry)} alt="" fill sizes="44px" unoptimized className="object-cover" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-theme-blue dark:text-white">{entry.name}</p>
				{entry.title ? (
					<p className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">{entry.title}</p>
				) : null}
			</div>

			{canEdit ? (
				<button
					type="button"
					onClick={() => onEdit(entry)}
					aria-label={`Edit ${entry.name}`}
					className="rounded-lg p-1.5 text-txt-muted hover:bg-theme-gray/10 hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:bg-white/10"
				>
					<Pencil className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
			{canDelete ? (
				<button
					type="button"
					onClick={() => onDelete(entry)}
					aria-label={`Remove ${entry.name}`}
					className="rounded-lg p-1.5 text-danger hover:bg-danger/10 dark:text-danger-dark dark:hover:bg-danger-dark/10"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
		</li>
	);
}

export default function LeaderboardEditor({ entries, agentOptions, canCreate, canEdit, canDelete }) {
	const router = useRouter();
	const [rows, setRows] = useState(entries);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [, startTransition] = useTransition();

	useEffect(() => {
		setRows(entries);
	}, [entries]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	function handleDragEnd(event) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = rows.findIndex((row) => row.id === active.id);
		const newIndex = rows.findIndex((row) => row.id === over.id);
		const previous = rows;
		const next = arrayMove(rows, oldIndex, newIndex);
		setRows(next);

		startTransition(async () => {
			const result = await reorderLeaderboardAction(next.map((row) => row.id));
			if (result?.error) {
				toast.error(result.error);
				setRows(previous);
			}
		});
	}

	function openAdd() {
		setEditing(null);
		setModalOpen(true);
	}

	function openEdit(entry) {
		setEditing(entry);
		setModalOpen(true);
	}

	function handleDelete(entry) {
		if (!window.confirm(`Remove ${entry.name} from the leaderboard?`)) return;
		startTransition(async () => {
			const result = await deleteLeaderboardEntryAction(entry.id);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`${entry.name} removed.`);
				router.refresh();
			}
		});
	}

	return (
		<div>
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">
					Drag to reorder — ranks 1–5 show as large cards, 6–10 as circle avatars on the homepage.
				</p>
				{canCreate ? (
					<Button type="button" size="sm" onClick={openAdd}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add producer
					</Button>
				) : null}
			</div>

			{rows.length === 0 ? (
				<div className="rounded-xl border border-theme-gold-light p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
					No producers yet.
				</div>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
						<ul className="space-y-2">
							{rows.map((entry, index) => (
								<SortableRow
									key={entry.id}
									entry={entry}
									rank={index + 1}
									canEdit={canEdit}
									canDelete={canDelete}
									onEdit={openEdit}
									onDelete={handleDelete}
								/>
							))}
						</ul>
					</SortableContext>
				</DndContext>
			)}

			<LeaderboardEntryModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				entry={editing}
				agentOptions={agentOptions}
			/>
		</div>
	);
}
