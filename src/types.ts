export interface ResumeItem {
  id: string;
  title: string;
  content: string;
  visible: boolean;
   isAdditional?: boolean; // Add this to track which items are from additional uploads
}

export interface ResumeSection {
  id: string;
  title: string;
  visible: boolean;
  items: ResumeItem[];
}