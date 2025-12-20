// components/ConfirmationModal.tsx
import { AlertTriangle } from 'lucide-react'; // Add this import for warning icon

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm, 
  onCancel 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Variant styles
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      iconBg: 'bg-red-100',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
      iconBg: 'bg-amber-100',
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBg: 'bg-blue-100',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
        <div className="flex items-start gap-4 mb-4">
          <div className={`${styles.iconBg} p-3 rounded-full flex-shrink-0`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}