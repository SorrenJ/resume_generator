import { ResumeSection, ResumeItem } from '../types';

export function parseMarkdown(markdown: string): ResumeSection[] {
  const lines = markdown.split('\n');
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  let currentItem: ResumeItem | null = null;
  let contentBuffer: string[] = [];

  const flushItem = () => {
    if (currentItem && currentSection) {
      currentItem.content = contentBuffer.join('\n').trim();
      currentSection.items.push(currentItem);
      currentItem = null;
      contentBuffer = [];
    }
  };

  const flushSection = () => {
    flushItem();
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  lines.forEach((line) => {
    if (line.startsWith('## ')) {
      flushSection();
      currentSection = {
        id: crypto.randomUUID(),
        title: line.substring(3).trim(),
        visible: true,
        items: [],
      };
    } else if (line.startsWith('### ')) {
      flushItem();
      if (currentSection) {
        currentItem = {
          id: crypto.randomUUID(),
          title: line.substring(4).trim(),
          content: '',
          visible: true,
        };
      }
    } else {
      if (currentItem) {
        contentBuffer.push(line);
      }
    }
  });

  flushSection();

  return sections;
}

export function sectionsToMarkdown(sections: ResumeSection[]): string {
  const lines: string[] = [];

  sections.forEach((section) => {
    if (section.visible) {
      lines.push(`## ${section.title}`);
      lines.push('');

      section.items.forEach((item) => {
        if (item.visible) {
          lines.push(`### ${item.title}`);
          lines.push('');
          if (item.content.trim()) {
            lines.push(item.content.trim());
            lines.push('');
          }
        }
      });
    }
  });

  return lines.join('\n').trim() + '\n';
}
