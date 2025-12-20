export interface ResumeItem {
  id: string;
  title: string;
  content: string;
  visible: boolean;
}

// Update ItemCardProps interface in ItemCard.tsx
interface ItemCardProps {
  item: ResumeItem;
  onToggleVisibility: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTitle: (id: string, title: string) => void; // Add this
  onDelete: (id: string) => void; // Add this
}


export interface ResumeSection {
  id: string;
  title: string;
  visible: boolean;
  items: ResumeItem[];
}
