export interface ResumeItem {
  id: string;
  title: string;
  content: string;
  visible: boolean;
}

export interface ResumeSection {
  id: string;
  title: string;
  visible: boolean;
  items: ResumeItem[];
}