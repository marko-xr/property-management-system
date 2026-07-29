import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, align }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState<'left' | 'right'>('right');
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'bottom'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Determine horizontal positioning
      if (align) {
        setHorizontalAlign(align === 'right' ? 'left' : 'right');
      } else {
        // Auto-detect based on screen space
        if (rect.left < 210) {
          // Near left edge of screen -> open towards right (left-0)
          setHorizontalAlign('left');
        } else if (windowWidth - rect.right < 210) {
          // Near right edge of screen -> open towards left (right-0)
          setHorizontalAlign('right');
        } else {
          // Default in RTL layout is right-0 (opens leftwards)
          setHorizontalAlign('right');
        }
      }

      // Determine vertical positioning
      if (windowHeight - rect.bottom < 220 && rect.top > 220) {
        // Near bottom edge of viewport -> open upwards
        setVerticalAlign('top');
      } else {
        setVerticalAlign('bottom');
      }
    }

    setIsOpen(!isOpen);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative inline-block text-right no-print" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs cursor-pointer flex items-center justify-center bg-white"
        title="خيارات وإجراءات"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs font-semibold overflow-hidden transition-all duration-150 animate-in fade-in zoom-in-95 ${
            horizontalAlign === 'left' ? 'left-0' : 'right-0'
          } ${
            verticalAlign === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => {
            let colorClasses = 'text-slate-700 hover:bg-slate-50 hover:text-slate-900';
            if (item.variant === 'danger') {
              colorClasses = 'text-red-600 hover:bg-red-50 hover:text-red-700';
            } else if (item.variant === 'warning') {
              colorClasses = 'text-amber-700 hover:bg-amber-50 hover:text-amber-800';
            } else if (item.variant === 'success') {
              colorClasses = 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800';
            } else if (item.variant === 'info') {
              colorClasses = 'text-blue-700 hover:bg-blue-50 hover:text-blue-800';
            }

            return (
              <button
                key={index}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full text-right px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer border-b border-slate-100 last:border-0 ${colorClasses} ${
                  item.disabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

