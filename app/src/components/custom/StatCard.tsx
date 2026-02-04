import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  description: string;
  delay?: number;
}

export function StatCard({ 
  icon: Icon, 
  iconBgColor, 
  iconColor, 
  label, 
  value, 
  description,
  delay = 0 
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-card transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isHovered ? 'shadow-card-hover -translate-y-0.5 border border-[#07c160]' : 'border border-transparent'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div 
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ${iconBgColor} ${isHovered ? 'scale-110 rotate-3' : ''}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        
        {/* 内容 */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 font-number text-xl font-semibold text-gray-900 truncate">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 truncate">{description}</p>
        </div>
      </div>

      {/* 悬停装饰 */}
      <div className={`absolute -right-2 -bottom-2 h-16 w-16 rounded-full bg-gradient-to-br from-[#07c160]/5 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
