import { useState, useRef } from 'react';
import { Upload, Download, FileDown, Eye } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { ResumeSection } from './types';
import { parseMarkdown, sectionsToMarkdown } from './utils/markdownParser';
import { SectionCard } from './components/SectionCard';
import { ResumePreview } from './components/ResumePreview';

const SAMPLE_MARKDOWN = `

## Sorren Jao | Full Stack Developer

### 

Richmond, BC | [(604)-353-4265](tel: 6043534265) | [Email](mailto: soalexjao@gmail.com) | [Portfolio](https://sorrenj.github.io/) | [LinkedIn](https://www.linkedin.com/in/sorren-alex-jao/) | [Github](https://github.com/SorrenJ)

## Profile

### 

A Backend Developer passionate about leveraging AI and LLMs to build intuitive mobile apps that simplify complex domains like FinTech. Takes pride in writing clean, efficient, and user-first code, with a proven ability to make a rapid impact in agile, product-driven teams.

## Skills

### Web & Backend

PHP, Node.js, Express.js, RESTful APIs, EJS, JSON, Ruby on Rails, Ajax

### Programming Languages:

Python, JavaScript (ES6), Java, C#, Dart, Ruby, TypeScript

### Databases:

PostgreSQL, MySQL, SQLite, MSSQL, NoSQL

### Tools & Platforms:

Git, GitHub, Jira, AWS (EC2, RDS, S3), Docker, Azure, MongoDB, Supabase

### Mobile Development:

Android (Java, Android SDK), Flutter, Camera APIs, TensorFlow Lite

### Other:

Agile/Scrum, API Design, Unit & Integration Testing, LLM Integration (OpenAI, Ollama)

## Work Experience

### Software Developer (AI & Backend), Expense Trend | 02/2025 – 05/2025

- Deployed and configured GPT-based LLM servers on AWS EC2, reducing deployment costs.
- Developed RESTful API endpoints in Express.js and conducted unit/integration testing using Swagger.
- Collaborated with Stripe microservices developers and frontend teams via JIRA in an Agile environment.
- Refined AI-generated outputs for financial advice applications and maintained API documentation.

### Web Developer, Cybersalt Consulting Ltd. | 05/2022 – 09/2022

- Built and optimized business websites using Joomla! and WordPress, improving SEO and UX.
- Led frontend development for landing pages with a focus on usability and accessibility.
- Conducted usability testing and provided client support through custom CSS, JavaScript, and PHP.

### Web Designer (Marketing), Simon Fraser University (SFU) | 01/2021 – 09/2021

- Designed web banners, marketing emails, and content-managed SFU web pages.
- Developed a PHP & jQuery browser tool to optimize graduate student profile performance.

## Projects

### Financial Assistant (Mobile App) | 02/2025 – 05/2025

A mobile app using prompt engineering and semantic search to deliver personalized financial advice from transaction data.  
Built backend APIs consumed by iOS/Android clients with Node.js, Express, MySQL, MSSQL, and Azure.

### Wildlife and Pest Animal Detection | 03/2024

End-to-end computer vision system for automated detection of animals in large image datasets.  
Utilized YOLOv8, TensorFlow, Python, and data preprocessing pipelines for environmental monitoring.

### Facemask Detection App | 04/2022

Android app built with TensorFlow Lite and YOLOv2 for real-time mask detection.  
Implemented asynchronous camera processing and MVVM architecture patterns.

## Education

### Diploma in Full-Stack Web Development, Lighthouse Labs | 03/2024 – 10/2024

The award winner for the Lighthouse Labs prize funding.

### Bachelor of Science, Interactive Arts & Technology Simon Fraser University | 09/2016 – 04/2024

A multidisciplinary program combining Computer Science, Artificial Intelligence, and UX Design. Coursework and projects explored topics such as mobile development, Object-Oriented Programming (OOP), and Data Structures & Algorithms.

## Certificates

### Hugging Face - The LLM Course | 10/2025

Has successfully completed [Fundamentals of LLMs](https://huggingface.co/spaces/huggingface-course/chapter_1_exam/discussions/123#68f5cfee0748d548e5e8e54d)

### Amazon AWS Certified Cloud Practitioner

In Progress

`;

function App() {
  const [sections, setSections] = useState<ResumeSection[]>(() => parseMarkdown(SAMPLE_MARKDOWN));
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
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
              <ResumePreview sections={sections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
