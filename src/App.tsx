import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileDown, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeSection } from './types';
import { parseMarkdown, sectionsToMarkdown } from './utils/markdownParser';
import { SectionCard } from './components/SectionCard';
import { ResumePreview } from './components/ResumePreview';

const SAMPLE_MARKDOWN = `# John Doe
## Senior Software Engineer
john.doe@email.com | (123) 456-7890 | linkedin.com/in/johndoe | github.com/johndoe

## Summary
Senior Software Engineer with 8+ years of experience in full-stack development...

## Experience
### Senior Software Engineer | TechCorp Inc. | Jan 2020 - Present
- Led a team of 5 developers in redesigning the core platform...
- Implemented microservices architecture that improved system scalability by 40%...
- Reduced API response time by 60% through query optimization and caching...

### Software Engineer | StartupCo | Jun 2017 - Dec 2019
- Developed responsive web applications using React and TypeScript...
- Collaborated with product team to implement user-friendly features...

## Education
### Bachelor of Science in Computer Science
University of Technology | 2013 - 2017
GPA: 3.8/4.0

## Skills
**Programming:** JavaScript, TypeScript, Python, Java
**Frameworks:** React, Node.js, Express, Django
**Tools:** Git, Docker, AWS, Jenkins
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

  const handleExportPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      console.error('Preview element not found');
      return;
    }

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      // Set PDF properties
      pdf.setProperties({
        title: 'Resume',
        subject: 'Professional Resume',
        author: 'Resume Generator',
        creator: 'Resume Generator App'
      });

      // Extract text content from the preview
      const extractTextFromElement = (el: HTMLElement): string => {
        let text = '';
        
        // Handle different element types
        if (el.tagName === 'H1') {
          text += el.textContent + '\n\n';
        } else if (el.tagName === 'H2') {
          text += el.textContent + '\n';
        } else if (el.tagName === 'H3') {
          text += el.textContent + '\n';
        } else if (el.tagName === 'P') {
          text += el.textContent + '\n';
        } else if (el.tagName === 'LI') {
          text += '• ' + el.textContent + '\n';
        } else if (el.tagName === 'UL' || el.tagName === 'DIV') {
          // Process children
          Array.from(el.children).forEach(child => {
            text += extractTextFromElement(child as HTMLElement);
          });
        } else {
          text += el.textContent + '\n';
        }
        
        return text;
      };

      // Extract all text content
      const textContent = extractTextFromElement(element);
      
      // Split text into lines
      const lines = textContent.split('\n');
      
      // PDF settings
      const margin = 0.5;
      const pageWidth = 8.5;
      const pageHeight = 11;
      const lineHeight = 0.2;
      let yPosition = margin;
      
      // Add text to PDF
      pdf.setFont('helvetica');
      pdf.setFontSize(11);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Check if line is a heading
        if (line.trim() && i < lines.length - 1) {
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.trim() && !nextLine.startsWith('•')) {
            // Check if this is a heading based on text patterns
            if (line.includes('|') || line.includes('@')) {
              // Contact info or similar
              pdf.setFontSize(10);
            } else if (line.trim().length < 50 && !line.startsWith('•')) {
              // Likely a section heading
              if (yPosition > margin) yPosition += lineHeight;
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.text(line.trim(), margin, yPosition);
              yPosition += lineHeight * 1.5;
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              continue;
            }
          }
        }
        
        // Add regular line
        if (line.trim()) {
          // Handle bullet points
          if (line.startsWith('•')) {
            const bulletText = line.substring(1).trim();
            pdf.text('•', margin, yPosition);
            pdf.text(bulletText, margin + 0.1, yPosition);
          } else {
            pdf.text(line.trim(), margin, yPosition);
          }
          yPosition += lineHeight;
        } else {
          // Empty line - add some spacing
          yPosition += lineHeight * 0.5;
        }
      }

      // Save the PDF
      pdf.save('resume.pdf');
      
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to html2canvas method with better settings
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'letter'
        });
        
        const imgWidth = 7.5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0.5, 0.5, imgWidth, imgHeight);
        pdf.save('resume-fallback.pdf');
      } catch (fallbackError) {
        console.error('Fallback PDF export also failed:', fallbackError);
        alert('Failed to export PDF. Please try again.');
      }
    }
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