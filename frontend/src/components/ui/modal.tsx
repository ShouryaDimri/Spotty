import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto">
      {/* Backdrop */}
      <div className="min-h-screen px-4 text-center">
        <div 
          className="fixed inset-0 bg-black opacity-50" 
          onClick={onClose}
        />
        
        {/* Centering trick */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-zinc-900 shadow-xl rounded-2xl border border-zinc-700 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-white">
              {title}
            </h3>
            <button
              type="button"
              className="text-zinc-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};