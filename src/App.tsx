import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileDown, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeSection } from './types';
import { parseMarkdown, sectionsToMarkdown } from './utils/markdownParser';
import { SectionCard } from './components/SectionCard';
import { ResumePreview } from './components/ResumePreview';

const SAMPLE_MARKDOWN = `# John Doe
## Full Stack Engineer
### /
john.doe@email.com | (123) 456-7890 | linkedin.com/in/johndoe | github.com/johndoe

## Summary
### /
Desc here

## Technical Skills  
**Programming:** JavaScript, TypeScript, Python, Java
**Frameworks:** React, Node.js, Express, Django
**Tools:** Git, Docker, AWS, Jenkins

## Experience

### Software Developer (AI & Backend) | Expense Trend | Feb 2025 – May 2025



### Web Developer | Cybersalt Consulting Ltd. | May 2022 – Sep 2022

## Technical Projects  
### ResumeForge — ATS-Optimized Resume Builder | Dec 2025 
### Financial Assistant (Mobile App) | Feb 2025 – May 2025
### AI Digital Twin (Full-Stack Chatbot) | Jan 2025
## Education

### Diploma in Full-Stack Web Development | Lighthouse Labs | Mar 2024 – Oct 2024

- Awarded the Lighthouse Labs prize funding for outstanding project work and technical excellence

### Bachelor of Science, Interactive Arts & Technology | Simon Fraser University | Sep 2016 – Apr 2024

- Coursework included Object-Oriented Programming, Data Structures & Algorithms, Mobile Development, Software Engineering, and Web Technologies

`;

function App() {
  const [sections, setSections] = useState<ResumeSection[]>(() => parseMarkdown(SAMPLE_MARKDOWN));
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseMarkdown(content);
      setSections(parsed);
    };
    reader.readAsText(file);
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      )
    );
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, title } : section))
    );
  };

  const handleToggleItemVisibility = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, visible: !item.visible } : item
              ),
            }
          : section
      )
    );
  };

// App.tsx - Add this function inside the App component
const handleAddItem = (sectionId: string) => {
  setSections(prev =>
    prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: [
              ...section.items,
              {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `New Achievement`, // Better default title
                content: 'Describe your accomplishment...',
                visible: true,
              },
            ],
          }
        : section
    )
  );
};


  const handleUpdateItemContent = (sectionId: string, itemId: string, content: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, content } : item
              ),
            }
          : section
      )
    );
  };

const handleUpdateItemTitle = (sectionId: string, itemId: string, title: string) => {
  setSections((prev) =>
    prev.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, title } : item
            ),
          }
        : section
    )
  );
};

const handleDeleteItem = (sectionId: string, itemId: string) => {
  setSections((prev) =>
    prev.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          }
        : section
    )
  );
};

// App.tsx - Add this function
const handleReorderItems = (sectionId: string, activeId: string, overId: string) => {
  setSections(prev =>
    prev.map(section => {
      if (section.id !== sectionId) return section;

      const oldIndex = section.items.findIndex(item => item.id === activeId);
      const newIndex = section.items.findIndex(item => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) return section;

      const newItems = [...section.items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      return {
        ...section,
        items: newItems,
      };
    })
  );
};

  const handleDownloadMarkdown = () => {
    const markdown = sectionsToMarkdown(sections);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


const handleExportPDF = () => {
  const element = document.getElementById('resume-preview');
  if (!element) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  const margin = 0.5;
  const pageWidth = 8.5;
  const pageHeight = 11;
  let yPos = margin;
  let currentX = margin; // Track X position for inline elements
  let currentFontSize = 10;
  const showFullURLs = false; // Set to false to hide URLs
  const lineHeight = 0.2;

  // Helper function to extract all text content from an element and its children
  const getFullTextContent = (element: HTMLElement): string => {
    let text = '';
    
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while ((node = walker.nextNode())) {
      text += node.textContent || '';
    }
    
    return text;
  };

    // Function to add text at current position
  const addText = (text: string, indent = 0, isInline = false) => {
    if (!text.trim() && text !== ' ') return;

    const availableWidth = pageWidth - (2 * margin) - indent - (currentX - margin);
    const lines = pdf.splitTextToSize(text, availableWidth);

    // CHANGED: Use a local variable to track the final X position
    let finalX = currentX; 

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let xPos: number;

      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        currentX = margin;
      }

      if (i === 0) {
        // First line continues from currentX
        xPos = currentX;
      } else {
        // Subsequent lines start at the indent
        yPos += lineHeight;
        currentX = margin + indent;
        xPos = currentX;
        
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          currentX = margin + indent;
          xPos = currentX;
        }
      }

      pdf.text(line, xPos, yPos);
      
      // CHANGED: Update the local finalX variable in each iteration
      const lineWidth = pdf.getTextWidth(line) / 72; // Convert points to inches
      finalX = xPos + lineWidth;
    }
    
    // CHANGED: Update the global currentX only once, with the final position
    currentX = finalX;
  };

  // Function to add separator between inline elements
  const addSeparator = (separator = ' ') => {
    const separatorWidth = pdf.getTextWidth(separator) / 72;
    
    // Check if separator fits on current line
    if (currentX + separatorWidth > pageWidth - margin) {
      // Doesn't fit, move to next line
      yPos += lineHeight;
      currentX = margin;
      
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        currentX = margin;
      }
    }
    
    pdf.text(separator, currentX, yPos);
    currentX += separatorWidth;
  };

  // Function to process child nodes
  const processChildren = (element: HTMLElement, indent = 0, isInlineContext = false, isFirstInParent = true) => {
    const children = Array.from(element.childNodes);
    
    children.forEach((child, index) => {
      const isFirstInElement = isFirstInParent && index === 0;
      processNode(child, indent, isInlineContext, isFirstInElement);
    });
  };

  
  // Function to process nodes recursively
  const processNode = (node: Node, indent = 0, isInlineContext = false, isFirstInElement = true) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Text node
      const text = node.textContent || '';
      
      // Add separator before text if not first in inline context
      if (!isFirstInElement && isInlineContext && text.trim()) {
        addSeparator();
      }
      
      addText(text, indent, isInlineContext);
      
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      
      // Handle different HTML elements
      if (element.tagName === 'H1') {
        // End any inline context
        currentX = margin;
        
        // Add space before H1 if not at top
        if (yPos > margin + 0.1) {
          yPos += 0.075;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        processChildren(element, 0, false);
        yPos += 0.075;
        pdf.setFontSize(currentFontSize);
        pdf.setFont('helvetica', 'normal');
        currentX = margin;
        
      } else if (element.tagName === 'H2') {
        // End any inline context
        currentX = margin;
        
        // Add space before H2
        yPos += 0.075;
        pdf.setFontSize(11.5);
        pdf.setFont('helvetica', 'bold');
        processChildren(element, 0, false);
        yPos += 0.075;
        pdf.setFontSize(currentFontSize);
        pdf.setFont('helvetica', 'normal');
        currentX = margin;
        
 } else if (element.tagName === 'H3') {
  // End any inline context
  currentX = margin;
  
  // Add more space before H3 (0.15 inches)
  yPos += 0.075;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  processChildren(element, 0, false);
  // Reduced space after H3 (0.1 inches)
  yPos += 0.075;
  pdf.setFontSize(currentFontSize);
  pdf.setFont('helvetica', 'normal');
  currentX = margin;
  
} else if (element.tagName === 'A') {
  const href = element.getAttribute('href') || '';
  
  if (href) {
    const linkText = getFullTextContent(element);
    const linkWidth = pdf.getTextWidth(linkText);
    
    // Save current position
    const startX = currentX;
    const startY = yPos;
    
    // Add text
    pdf.setTextColor(0, 0, 255);
    pdf.textWithLink(linkText, currentX, yPos, { url: href });
    
    // Update position
       currentX += linkWidth + 1;
      //  yPos += 0.2;
    // Add URL text for reference
    if (showFullURLs) {
      pdf.setTextColor(128, 128, 128);
      pdf.setFont(pdf.getFont().fontName, 'italic');
      addText(` (${href})`, indent, false);
    }
    
    pdf.setTextColor(0, 0, 0);
  } else {
    processChildren(element, indent, isInlineContext, isFirstInElement);
  }
        
      } else if (element.tagName === 'LI') {
        // List item - start new line
        currentX = margin;
        
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          currentX = margin;
        }
        
        const bullet = '• ';
        const bulletIndent = indent + 0.1;
        
        // Add bullet
        addText(bullet, indent, false);
        
        // Process content
        processChildren(element, bulletIndent, true);
        
        // End list item
        yPos += 0.1;
        currentX = margin;
        
      } else if (element.tagName === 'P' || element.tagName === 'DIV') {
        // End any inline context
        currentX = margin;
        
        // Add space before paragraph if needed
        if (yPos > margin) {
          yPos += 0.1;
        }
        
        // Process paragraph content as inline
        processChildren(element, indent, true);
        
        // End paragraph
        yPos += 0.1;
        currentX = margin;
        
      } else if (element.tagName === 'BR') {
        // Line break
        yPos += lineHeight;
        currentX = margin;
        
      } else if (element.tagName === 'SPAN' || element.tagName === 'STRONG' || element.tagName === 'EM' || 
                 element.tagName === 'B' || element.tagName === 'I') {
        // Inline elements - process children inline
        
        // Handle specific formatting
        const originalFont = pdf.getFont();
        
        if (element.tagName === 'STRONG' || element.tagName === 'B') {
          pdf.setFont(originalFont.fontName, 'bold');
        } else if (element.tagName === 'EM' || element.tagName === 'I') {
          pdf.setFont(originalFont.fontName, 'italic');
        }
        
        processChildren(element, indent, true, isFirstInElement);
        
        // Restore font if we changed it
        if (element.tagName === 'STRONG' || element.tagName === 'B' || 
            element.tagName === 'EM' || element.tagName === 'I') {
          pdf.setFont(originalFont.fontName, 'normal');
        }
        
      } else if (element.tagName === 'UL' || element.tagName === 'OL') {
        // Lists
        currentX = margin;
        processChildren(element, indent + 0.2, false);
        yPos += 0.1; // Space after list
        currentX = margin;
        
      } else {
        // Default for other block-level elements
        currentX = margin;
        processChildren(element, indent, false);
        currentX = margin;
      }
    }
  };



  
  // Start processing
  pdf.setFont('helvetica');
  pdf.setFontSize(currentFontSize);
  processChildren(element, 0, false);
  
  pdf.save('resume.pdf');
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Generator</h1>
          <p className="text-gray-600">
            Edit your markdown resume, toggle sections and items, and export to PDF
          </p>
        </header>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Upload className="w-4 h-4" />
            Load Markdown
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Download Markdown
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <FileDown className="w-4 h-4" />
            Export to PDF
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editor</h2>
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onToggleVisibility={handleToggleSectionVisibility}
                  onUpdateTitle={handleUpdateSectionTitle}
                  onToggleItemVisibility={handleToggleItemVisibility}
                  onUpdateItemContent={handleUpdateItemContent}
                  onAddItem={handleAddItem}
                  onUpdateItemTitle={handleUpdateItemTitle}
                  onDeleteItem={handleDeleteItem} 
                  onReorderItems={handleReorderItems}
                />
              ))}
            </div>
          </div>

          {showPreview && (
            <div className="lg:sticky lg:top-8 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview</h2>
              <div ref={previewRef}>
                <ResumePreview sections={sections} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;