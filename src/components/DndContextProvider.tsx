import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ReactNode, useState } from 'react';
import { ResumeItem } from '../types';

interface DndProviderProps {
  children: ReactNode;
  items: ResumeItem[]; 
  onDragEnd: (activeId: string, overId: string) => void;
}

export function DndProvider({ children, items, onDragEnd }: DndProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      onDragEnd(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50 border rounded-lg p-4 bg-white shadow-lg">
            <div className="font-medium">Dragging...</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}