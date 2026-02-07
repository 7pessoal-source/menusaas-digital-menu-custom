import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={cn('bg-white w-full rounded-3xl shadow-2xl overflow-hidden', sizes[size])}>
        {title && (
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-bold uppercase tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="p-6 bg-gray-50 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
