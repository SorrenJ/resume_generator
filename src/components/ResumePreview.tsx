import { ResumeSection } from '../types';
import { parseMarkdownLinks } from '../utils/linkParser';

interface ResumePreviewProps {
  sections: ResumeSection[];
}

function renderContent(content: string) {
  const parts = parseMarkdownLinks(content);

  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={index}>{part}</span>;
    }
    return (
      <a
        key={index}
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {part.text}
      </a>
    );
  });
}

export function ResumePreview({ sections }: ResumePreviewProps) {
  return (
    <div id="resume-preview" className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
      <div className="prose prose-sm max-w-none">
        {sections
          .filter((section) => section.visible)
          .map((section) => (
            <div key={section.id} className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">
                {section.title}
              </h2>
              {section.items
                .filter((item) => item.visible)
                .map((item) => (
                  <div key={item.id} className="mb-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {renderContent(item.content)}
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}
