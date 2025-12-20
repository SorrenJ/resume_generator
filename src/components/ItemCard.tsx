import { useState } from 'react';
import { Eye, EyeOff, Link2 } from 'lucide-react';
import { ResumeItem } from '../types';
import { LinkModal } from './LinkModal';
import { insertLink } from '../utils/linkParser';

interface ItemCardProps {
  item: ResumeItem;
  onToggleVisibility: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
}

export function ItemCard({ item, onToggleVisibility, onUpdateContent }: ItemCardProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const textareaRef = useState<HTMLTextAreaElement | null>(null)[1];

  const handleInsertLink = (text: string, url: string) => {
    const newContent = insertLink(item.content, text, url);
    onUpdateContent(item.id, newContent);
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 transition-opacity ${
          item.visible ? 'bg-white' : 'bg-gray-50 opacity-60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{item.title}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Insert link"
            >
              <Link2 className="w-4 h-4 text-blue-600" />
            </button>
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
        <textarea
          ref={(el) => {
            if (el) textareaRef(el);
          }}
          value={item.content}
          onChange={(e) => onUpdateContent(item.id, e.target.value)}
          className="w-full p-2 border rounded text-sm font-mono resize-vertical min-h-[80px]"
          placeholder="Item description... Use [text](url) for links"
        />
      </div>

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsertLink={handleInsertLink}
      />
    </>
  );
}
