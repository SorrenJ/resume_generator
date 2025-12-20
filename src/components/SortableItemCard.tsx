// components/SortableItemCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // Add grip icon
import { ItemCard } from './ItemCard';
import { ResumeItem } from '../types';

interface SortableItemCardProps {
  item: ResumeItem;
  onToggleVisibility: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function SortableItemCard({
  item,
  onToggleVisibility,
  onUpdateContent,
  onUpdateTitle,
  onDelete,
}: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-50 z-10' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <ItemCard
        item={item}
        onToggleVisibility={onToggleVisibility}
        onUpdateContent={onUpdateContent}
        onUpdateTitle={onUpdateTitle}
        onDelete={onDelete}
      />
    </div>
  );
}