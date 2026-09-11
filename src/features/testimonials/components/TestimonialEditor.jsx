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
import Button from "@/components/ui/Button";
import TestimonialModal from "./TestimonialModal";
import { deleteTestimonialAction, reorderTestimonialsAction } from "../actions";

function SortableRow({ testimonial, canEdit, canDelete, onEdit, onDelete }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: testimonial.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 rounded-2xl border border-theme-gold-light/70 bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,.04)] transition-shadow hover:shadow-[0_4px_14px_-8px_rgba(20,20,20,.15)] dark:border-border-dark dark:bg-surface-dark"
		>
			<button
				type="button"
				className="cursor-grab touch-none text-txt-muted hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:text-txt-secondary-dark"
				aria-label={`Reorder testimonial from ${testimonial.clientName}`}
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-5 w-5" aria-hidden="true" />
			</button>

			<span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-theme-gray/10 dark:bg-white/5">
				<Image src={testimonial.photo} alt="" fill sizes="44px" unoptimized className="object-cover object-top" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-theme-blue dark:text-white">
					{testimonial.clientName}{" "}
					<span className="font-normal text-txt-muted dark:text-txt-muted-dark">
						— for {testimonial.agentDisplayName}
					</span>
				</p>
				<p className="truncate text-xs text-txt-muted dark:text-txt-muted-dark">{testimonial.quote}</p>
			</div>

			{canEdit ? (
				<button
					type="button"
					onClick={() => onEdit(testimonial)}
					aria-label={`Edit testimonial from ${testimonial.clientName}`}
					className="rounded-lg p-1.5 text-txt-muted hover:bg-theme-gray/10 hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:bg-white/10"
				>
					<Pencil className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
			{canDelete ? (
				<button
					type="button"
					onClick={() => onDelete(testimonial)}
					aria-label={`Remove testimonial from ${testimonial.clientName}`}
					className="rounded-lg p-1.5 text-danger hover:bg-danger/10 dark:text-danger-dark dark:hover:bg-danger-dark/10"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
		</li>
	);
}

export default function TestimonialEditor({ testimonials, agentOptions, canCreate, canEdit, canDelete }) {
	const router = useRouter();
	const [rows, setRows] = useState(testimonials);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [, startTransition] = useTransition();

	useEffect(() => {
		setRows(testimonials);
	}, [testimonials]);

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
			const result = await reorderTestimonialsAction(next.map((row) => row.id));
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

	function openEdit(testimonial) {
		setEditing(testimonial);
		setModalOpen(true);
	}

	function handleDelete(testimonial) {
		if (!window.confirm(`Remove the testimonial from ${testimonial.clientName}?`)) return;
		startTransition(async () => {
			const result = await deleteTestimonialAction(testimonial.id);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Testimonial removed.");
				router.refresh();
			}
		});
	}

	return (
		<div>
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="text-xs text-txt-muted dark:text-txt-muted-dark">
					Drag to reorder — this is the order they play in the homepage carousel.
				</p>
				{canCreate ? (
					<Button type="button" size="sm" onClick={openAdd}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add testimonial
					</Button>
				) : null}
			</div>

			{rows.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-theme-gold-light/80 p-12 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
					No testimonials yet.
				</div>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
						<ul className="space-y-2">
							{rows.map((testimonial) => (
								<SortableRow
									key={testimonial.id}
									testimonial={testimonial}
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

			<TestimonialModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				testimonial={editing}
				agentOptions={agentOptions}
			/>
		</div>
	);
}
