"use client";

import { useState } from "react";
import Image from "next/image";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, X } from "lucide-react";
import MediaPickerModal from "@/features/media/components/MediaPickerModal";
import Button from "@/components/ui/Button";

function SortablePhoto({ url, index, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="group relative aspect-square overflow-hidden rounded-xl border border-theme-gold-light dark:border-border-dark"
		>
			<Image src={url} alt="" fill sizes="150px" unoptimized className="object-cover" />
			{index === 0 ? (
				<span className="absolute left-1.5 top-1.5 rounded-full bg-theme-gold px-2 py-0.5 text-[10px] font-semibold text-theme-blue">
					Cover
				</span>
			) : null}
			<button
				type="button"
				{...attributes}
				{...listeners}
				aria-label="Drag to reorder"
				className="absolute bottom-1.5 left-1.5 cursor-grab touch-none rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
			>
				<GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
			<button
				type="button"
				onClick={() => onRemove(url)}
				aria-label="Remove photo"
				className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
			>
				<X className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
		</div>
	);
}

// Ordered gallery editor for a property's image_urls — add photos from the
// shared media library (properties/ folder), drag to reorder (the first
// photo is the cover shown everywhere the property appears as a card),
// remove individually. `value`/`onChange` match RHF's Controller shape.
export default function PropertyPhotosField({ value, onChange }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const urls = value ?? [];

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	function handleDragEnd(event) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = urls.indexOf(active.id);
		const newIndex = urls.indexOf(over.id);
		onChange(arrayMove(urls, oldIndex, newIndex));
	}

	function handleRemove(url) {
		onChange(urls.filter((u) => u !== url));
	}

	function handlePicked(pickedUrls) {
		const merged = [...urls, ...pickedUrls.filter((url) => !urls.includes(url))];
		onChange(merged);
	}

	return (
		<div>
			{urls.length > 0 ? (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={urls} strategy={rectSortingStrategy}>
						<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{urls.map((url, index) => (
								<SortablePhoto key={url} url={url} index={index} onRemove={handleRemove} />
							))}
						</div>
					</SortableContext>
				</DndContext>
			) : (
				<p className="rounded-xl border border-dashed border-theme-gold-light p-6 text-center text-sm text-txt-muted dark:border-border-dark dark:text-txt-muted-dark">
					No photos yet.
				</p>
			)}

			<Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setPickerOpen(true)}>
				<ImagePlus className="h-4 w-4" aria-hidden="true" />
				Add photos
			</Button>
			<p className="mt-1.5 text-xs text-txt-muted dark:text-txt-muted-dark">
				Drag to reorder — the first photo is the cover shown on cards and search results.
			</p>

			<MediaPickerModal
				open={pickerOpen}
				onClose={() => setPickerOpen(false)}
				folders={["properties"]}
				multiple
				onSelect={handlePicked}
			/>
		</div>
	);
}
