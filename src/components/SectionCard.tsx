// SectionCard.tsx
import { Eye, EyeOff, Edit2, Check, Plus } from 'lucide-react'; // Add Plus icon
import { useState } from 'react';
import { ResumeSection } from '../types';
import { ItemCard } from './ItemCard';

interface SectionCardProps {
 section: ResumeSection;
  onToggleVisibility: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onToggleItemVisibility: (sectionId: string, itemId: string) => void;
  onUpdateItemContent: (sectionId: string, itemId: string, content: string) => void;
  onUpdateItemTitle: (sectionId: string, itemId: string, title: string) => void; // Add this
  onDeleteItem: (sectionId: string, itemId: string) => void; // Add this
  onAddItem: (sectionId: string) => void;
}

export function SectionCard({
  section,
  onToggleVisibility,
  onUpdateTitle,
  onToggleItemVisibility,
  onUpdateItemContent,
  onUpdateItemTitle, 
  onDeleteItem, 
  onAddItem, 
}: SectionCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);

  const handleSaveTitle = () => {
    onUpdateTitle(section.id, titleValue);
    setIsEditingTitle(false);
  };

  return (
    <div
      className={`border-2 rounded-lg p-6 transition-all ${
        section.visible ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-lg font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitleValue(section.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
              <button
                onClick={handleSaveTitle}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Save title"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Edit section title"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Add Item Button */}
          <button
            onClick={() => onAddItem(section.id)}
            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            title="Add new item"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Item</span>
          </button>
          
          {/* Toggle Visibility Button */}
          <button
            onClick={() => onToggleVisibility(section.id)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title={section.visible ? 'Hide section' : 'Show section'}
          >
            {section.visible ? (
              <Eye className="w-5 h-5 text-blue-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {section.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onToggleVisibility={(itemId) => onToggleItemVisibility(section.id, itemId)}
            onUpdateContent={(itemId, content) =>
              onUpdateItemContent(section.id, itemId, content)
            }
              onUpdateTitle={(itemId, title) => 
              onUpdateItemTitle(section.id, itemId, title)
            }
            onDelete={(itemId) => 
              onDeleteItem(section.id, itemId)
            }
          />
        ))}
        {section.items.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-400 text-sm italic mb-2">No items in this section</p>
            <button
              onClick={() => onAddItem(section.id)}
              className="flex items-center gap-1 mx-auto px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="text-sm">Add your first item</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}