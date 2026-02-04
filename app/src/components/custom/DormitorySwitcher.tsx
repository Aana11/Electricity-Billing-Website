import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import type { Dormitory } from '@/types';

interface DormitorySwitcherProps {
  dormitories: Dormitory[];
  currentDormitory: Dormitory;
  onSwitch: (dormitory: Dormitory) => void;
  onAddDormitory?: () => void;
}

export function DormitorySwitcher({ 
  dormitories, 
  currentDormitory, 
  onSwitch,
  onAddDormitory 
}: DormitorySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
      >
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{currentDormitory.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-2 py-1.5">选择宿舍</div>
            {dormitories.map((dorm) => (
              <button
                key={dorm.id}
                onClick={() => {
                  onSwitch(dorm);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  dorm.id === currentDormitory.id
                    ? 'bg-[#e6f7ed] text-[#07c160]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{dorm.name}</div>
                  <div className="text-xs text-gray-400">{dorm.userName}</div>
                </div>
                {dorm.id === currentDormitory.id && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
          
          {onAddDormitory && (
            <>
              <div className="border-t border-gray-100" />
              <div className="p-2">
                <button
                  onClick={() => {
                    onAddDormitory();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">添加宿舍</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
