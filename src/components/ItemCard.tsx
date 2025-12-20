// ItemCard.tsx
import { useState } from 'react';
import { Eye, EyeOff, Link2, Edit2, Check, X, Trash2 } from 'lucide-react';
import { ResumeItem } from '../types';
import { LinkModal } from './LinkModal';
import { ConfirmationModal } from './ConfirmationModal'; 
import { insertLink } from '../utils/linkParser';

interface ItemCardProps {
  item: ResumeItem;
  onToggleVisibility: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ 
  item, 
  onToggleVisibility, 
  onUpdateContent,
  onUpdateTitle,
  onDelete
}: ItemCardProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Add this state
  const [titleValue, setTitleValue] = useState(item.title);
  const textareaRef = useState<HTMLTextAreaElement | null>(null)[1];

  const handleInsertLink = (text: string, url: string) => {
    const newContent = insertLink(item.content, text, url);
    onUpdateContent(item.id, newContent);
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      onUpdateTitle(item.id, titleValue);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTitleValue(item.title);
    setIsEditingTitle(false);
  };

  // Update the delete handler
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 transition-opacity ${
          item.visible ? 'bg-white' : 'bg-gray-50 opacity-60'
        }`}
      >
        {/* Title Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  placeholder="Item title..."
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  title="Save title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTitleValue(item.title);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Edit item title"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Link Button */}
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Insert link"
            >
              <Link2 className="w-4 h-4 text-blue-600" />
            </button>
            
            {/* Delete Button - Updated */}
            <button
              onClick={handleDeleteClick}
              className="p-1 hover:bg-red-50 rounded transition-colors group"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
            </button>
            
            {/* Visibility Toggle */}
            <button
              onClick={() => onToggleVisibility(item.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={item.visible ? 'Hide item' : 'Show item'}
            >
              {item.visible ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          ref={(el) => {
            if (el) textareaRef(el);
          }}
          value={item.content}
          onChange={(e) => onUpdateContent(item.id, e.target.value)}
          className="w-full p-2 border rounded text-sm font-mono resize-vertical min-h-[80px] mt-2"
          placeholder="Item description... Use [text](url) for links"
        />
      </div>

      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsertLink={handleInsertLink}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}