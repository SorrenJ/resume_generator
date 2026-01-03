import { useState, useRef } from 'react';
import { Upload, Download, FileDown, Eye, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { ResumeSection, ResumeItem } from './types'; // Add ResumeItem import
import { parseMarkdown, sectionsToMarkdown } from './utils/markdownParser';
import { SectionCard } from './components/SectionCard';
import { ResumePreview } from './components/ResumePreview';
import { PDFSettingsPanel } from './components/PDFSettingsPanel';

const SAMPLE_MARKDOWN = `# John Doe
## Full Stack Engineer
### /
Richmond, BC | soalexjao@gmail.com | https://sorrenj.github.io/ | https://linkedin.com/in/sorren-alex-jao | https://github.com/SorrenJ

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

interface PDFSettings {
  fontSize: number;
  lineHeight: number;
  margins: number;
  showFullURLs: boolean;
}

function App() {
  const [additionalProjects, setAdditionalProjects] = useState<ResumeItem[]>([]);
  const [sections, setSections] = useState<ResumeSection[]>(() => parseMarkdown(SAMPLE_MARKDOWN));
  const [showPreview, setShowPreview] = useState(false);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    fontSize: 10,
    lineHeight: 0.2,
    margins: 0.5,
    showFullURLs: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectUploadRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseMarkdown(content);
      
      // Merge with existing additional projects
      const mergedSections = parsed.map(section => {
        if (section.title.toLowerCase().includes('project') && additionalProjects.length > 0) {
          return {
            ...section,
            items: [...section.items, ...additionalProjects]
          };
        }
        return section;
      });
      
      setSections(mergedSections);
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
                  title: `New Achievement`,
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
    const isAdditionalProject = additionalProjects.some(proj => proj.id === itemId);
  
    if (isAdditionalProject) {
      handleRemoveAdditionalProject(itemId);
    } else {
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
    }
  };

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

  const updateProjectsInSections = (projects: ResumeItem[]) => {
    setSections(prev => {
      const updatedSections = [...prev];
      const projectSectionIndex = updatedSections.findIndex(
        section => section.title.toLowerCase().includes('project')
      );

      if (projectSectionIndex !== -1) {
        // Filter out previously added additional projects
        const existingItems = updatedSections[projectSectionIndex].items.filter(
          item => !item.isAdditional
        );
        
        // Add new additional projects
        updatedSections[projectSectionIndex] = {
          ...updatedSections[projectSectionIndex],
          items: [...existingItems, ...projects.map(proj => ({
            ...proj,
            isAdditional: true
          }))]
        };
      } else {
        // Create a new projects section if it doesn't exist
        updatedSections.push({
          id: `section-${Date.now()}`,
          title: 'Technical Projects',
          items: projects.map(proj => ({
            ...proj,
            isAdditional: true
          })),
          visible: true
        });
      }

      return updatedSections;
    });
  };

  const handleUploadAdditionalProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Parse the markdown content
      const lines = content.split('\n');
      const newProjects: ResumeItem[] = [];
      let currentProject: Partial<ResumeItem> = {};

      lines.forEach((line) => {
        // Check for project headings (### indicates a project in markdown)
        if (line.trim().startsWith('### ')) {
          // Save previous project if exists
          if (currentProject.title && currentProject.content) {
            newProjects.push({
              id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: currentProject.title,
              content: currentProject.content,
              visible: true,
              isAdditional: true
            });
          }
          
          // Start new project
          const title = line.replace('### ', '').trim();
          currentProject = {
            title,
            content: '',
            visible: true
          };
        } 
        // Add content to current project (non-empty lines after title)
        else if (currentProject.title && line.trim()) {
          if (currentProject.content) {
            currentProject.content += '\n' + line;
          } else {
            currentProject.content = line;
          }
        }
      });

      // Add the last project
      if (currentProject.title && currentProject.content) {
        newProjects.push({
          id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: currentProject.title,
          content: currentProject.content,
          visible: true,
          isAdditional: true
        });
      }

      // Update additional projects state
      setAdditionalProjects(prev => [...prev, ...newProjects]);
      
      // Update the resume sections with new projects
      updateProjectsInSections(newProjects);

      // Reset file input
      if (projectUploadRef.current) {
        projectUploadRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Function to remove an additional project
  const handleRemoveAdditionalProject = (projectId: string) => {
    // Remove from additional projects state
    setAdditionalProjects(prev => prev.filter(proj => proj.id !== projectId));
    
    // Update sections to remove the project
    setSections(prev => {
      const updatedSections = [...prev];
      const projectSectionIndex = updatedSections.findIndex(
        section => section.title.toLowerCase().includes('project')
      );

      if (projectSectionIndex !== -1) {
        updatedSections[projectSectionIndex] = {
          ...updatedSections[projectSectionIndex],
          items: updatedSections[projectSectionIndex].items.filter(
            item => item.id !== projectId
          )
        };
      }

      return updatedSections;
    });
  };

  // Add a handler for manual project addition
  const handleAddManualProject = () => {
    const newProject: ResumeItem = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Additional Project',
      content: 'Describe your project here...',
      visible: true,
      isAdditional: true
    };

    setAdditionalProjects(prev => [...prev, newProject]);
    updateProjectsInSections([newProject]);
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

    const margin = pdfSettings.margins;
    const pageWidth = 8.5;
    const pageHeight = 11;
    let yPos = margin;
    let currentX = margin;
    let currentFontSize = pdfSettings.fontSize;
    const showFullURLs = pdfSettings.showFullURLs;
    const lineHeight = pdfSettings.lineHeight;

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
          xPos = currentX;
        } else {
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
        
        const lineWidth = pdf.getTextWidth(line) / 72;
        finalX = xPos + lineWidth;
      }
      
      currentX = finalX;
    };

    // Function to add separator between inline elements
    const addSeparator = (separator = ' ') => {
      const separatorWidth = pdf.getTextWidth(separator) / 72;
      
      if (currentX + separatorWidth > pageWidth - margin) {
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
        const text = node.textContent || '';
        
        if (!isFirstInElement && isInlineContext && text.trim()) {
          addSeparator();
        }
        
        addText(text, indent, isInlineContext);
        
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        if (element.tagName === 'H1') {
          currentX = margin;
          
          if (yPos > margin + 0.1) {
            yPos += 0.075;
          }
          
          pdf.setFontSize(currentFontSize * 1.2);
          pdf.setFont('helvetica', 'bold');
          processChildren(element, 0, false);
          yPos += 0.075;
          pdf.setFontSize(currentFontSize);
          pdf.setFont('helvetica', 'normal');
          currentX = margin;
          
        } else if (element.tagName === 'H2') {
          currentX = margin;
          yPos += 0.075;
          pdf.setFontSize(currentFontSize * 1.15);
          pdf.setFont('helvetica', 'bold');
          processChildren(element, 0, false);
          yPos += 0.075;
          pdf.setFontSize(currentFontSize);
          pdf.setFont('helvetica', 'normal');
          currentX = margin;
          
        } else if (element.tagName === 'H3') {
          currentX = margin;
          yPos += 0.075;
          pdf.setFontSize(currentFontSize * 1.1);
          pdf.setFont('helvetica', 'bold');
          processChildren(element, 0, false);
          yPos += 0.075;
          pdf.setFontSize(currentFontSize);
          pdf.setFont('helvetica', 'normal');
          currentX = margin;
          
        } else if (element.tagName === 'A') {
          const href = element.getAttribute('href') || '';
          
          if (href) {
            const linkText = getFullTextContent(element);
            const linkWidth = pdf.getTextWidth(linkText);
            
            pdf.setTextColor(0, 0, 255);
            pdf.textWithLink(linkText, currentX, yPos, { url: href });
            
            currentX += linkWidth + 1;
            
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
          currentX = margin;
          
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
            currentX = margin;
          }
          
          const bullet = '• ';
          const bulletIndent = indent + 0.1;
          
          addText(bullet, indent, false);
          processChildren(element, bulletIndent, true);
          yPos += 0.1;
          currentX = margin;
          
        } else if (element.tagName === 'P' || element.tagName === 'DIV') {
          currentX = margin;
          
          if (yPos > margin) {
            yPos += 0.1;
          }
          
          processChildren(element, indent, true);
          yPos += 0.1;
          currentX = margin;
          
        } else if (element.tagName === 'BR') {
          yPos += lineHeight;
          currentX = margin;
          
        } else if (element.tagName === 'SPAN' || element.tagName === 'STRONG' || element.tagName === 'EM' || 
                   element.tagName === 'B' || element.tagName === 'I') {
          const originalFont = pdf.getFont();
          
          if (element.tagName === 'STRONG' || element.tagName === 'B') {
            pdf.setFont(originalFont.fontName, 'bold');
          } else if (element.tagName === 'EM' || element.tagName === 'I') {
            pdf.setFont(originalFont.fontName, 'italic');
          }
          
          processChildren(element, indent, true, isFirstInElement);
          
          if (element.tagName === 'STRONG' || element.tagName === 'B' || 
              element.tagName === 'EM' || element.tagName === 'I') {
            pdf.setFont(originalFont.fontName, 'normal');
          }
          
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
          currentX = margin;
          processChildren(element, indent + 0.2, false);
          yPos += 0.1;
          currentX = margin;
          
        } else {
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
      {/* Add the PDFSettingsPanel here */}
      <PDFSettingsPanel onSettingsChange={setPdfSettings} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Generator</h1>
          <p className="text-gray-600">
            Edit your markdown resume, toggle sections and items, and export to PDF
          </p>
        </header>

        {/* Additional Projects Section - FIXED POSITION */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Additional Projects</h2>
            <div className="flex gap-2">
              <button
                onClick={() => projectUploadRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <Upload className="w-4 h-4" />
                Upload Projects Markdown
              </button>
              <button
                onClick={handleAddManualProject}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
            <input
              ref={projectUploadRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleUploadAdditionalProjects}
              className="hidden"
            />
          </div>
          
          <p className="text-gray-600 mb-4">
            Upload a markdown file with projects (each project should start with ### Title)
          </p>
          
          {additionalProjects.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Uploaded Projects ({additionalProjects.length})</h3>
              <div className="space-y-2">
                {additionalProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{project.title}</h4>
                      <p className="text-gray-600 text-sm truncate">
                        {project.content.substring(0, 100)}...
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveAdditionalProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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