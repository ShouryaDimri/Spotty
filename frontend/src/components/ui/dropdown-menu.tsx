import React, { useState, useRef, useEffect } from 'react';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  trigger, 
  children, 
  align = 'right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute top-full mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[50000] ${
          align === 'left' ? 'left-0' : 'right-0'
        } max-h-80 overflow-y-auto`}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-lg" />
          <div className="relative">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, onClick, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${className}`}
    >
      {icon && <span className="text-zinc-400 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="h-px bg-zinc-700 my-1" />;
};