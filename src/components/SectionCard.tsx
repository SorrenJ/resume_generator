import { Eye, EyeOff, Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { ResumeSection } from '../types';
import { ItemCard } from './ItemCard';

interface SectionCardProps {
  section: ResumeSection;
  onToggleVisibility: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onToggleItemVisibility: (sectionId: string, itemId: string) => void;
  onUpdateItemContent: (sectionId: string, itemId: string, content: string) => void;
}

export function SectionCard({
  section,
  onToggleVisibility,
  onUpdateTitle,
  onToggleItemVisibility,
  onUpdateItemContent,
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

      <div className="space-y-3">
        {section.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onToggleVisibility={(itemId) => onToggleItemVisibility(section.id, itemId)}
            onUpdateContent={(itemId, content) =>
              onUpdateItemContent(section.id, itemId, content)
            }
          />
        ))}
        {section.items.length === 0 && (
          <p className="text-gray-400 text-sm italic">No items in this section</p>
        )}
      </div>
    </div>
  );
}
