import React, { useState, useEffect } from 'react';
import { Icon } from '@/types';
import { iconsData, iconCategories } from '@/data/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';

interface DraggableIconProps {
  icon: Icon;
  onDragStart?: (iconId: string) => void;
  compact?: boolean;
  isMobile?: boolean;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ 
  icon, 
  onDragStart, 
  compact = false,
  isMobile = false 
}) => {
  const uniqueId = `${icon.id}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: uniqueId,
    data: {
      type: 'icon',
      icon: icon,
      sourceId: icon.id,
      uniqueInstanceId: uniqueId,
    },
  });

  const style = {
    zIndex: isDragging ? 1000 : 'auto',
    transition: 'none',
  };

  const handleDragStart = () => {
    if (onDragStart) {
      onDragStart(icon.id);
    }
  };

  // Enhanced responsive icon sizes with better mobile scaling
  const iconSizeClasses = compact 
    ? "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" 
    : "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16";

  // Enhanced responsive text sizes
  const textSizeClasses = compact
    ? "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs"
    : "text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-sm";

  // Enhanced responsive padding with better touch targets
  const paddingClasses = compact
    ? "p-1 xs:p-1.5 sm:p-2"
    : "p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4";

  // Mobile-specific classes
  const mobileClasses = isMobile 
    ? "min-h-[44px] min-w-[44px]" // iOS/Android recommended minimum touch target
    : "";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDragStart={handleDragStart}
      className={`
        ${paddingClasses} 
        ${mobileClasses}
        
        transition-all duration-200 
        bg-transparent border-none shadow-none 
        hover:bg-accent/50 active:bg-accent/70
        ${isDragging ? 'opacity-40 scale-110' : 'hover:scale-105 active:scale-95'}
        select-none touch-manipulation
        flex flex-col items-center justify-center
      `}
    >
      <div className="flex flex-col items-center space-y-0.5 xs:space-y-1 sm:space-y-1.5">
        <div className={`${iconSizeClasses} flex items-center justify-center bg-transparent shrink-0`}>
          <img
            src={icon.src}
            alt={icon.name}
            className="w-full h-full object-contain bg-transparent pointer-events-none"
            draggable={false}
          />
        </div>
        <span className={`
          ${textSizeClasses} 
          text-center font-medium leading-tight 
          text-muted-foreground truncate 
          max-w-full px-0.5
        `}>
          {icon.name}
        </span>
      </div>
    </Card>
  );
};

export const IconDragOverlay: React.FC<{ icon: Icon }> = ({ icon }) => {
  return (
    <Card className="p-2 sm:p-3 md:p-4 border-none bg-transparent  rotate-3 scale-110">
      <div className="flex flex-col items-center space-y-1 sm:space-y-1.5">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-transparent">
          <img
            src={icon.src}
            alt={icon.name}
            className="w-full h-full object-contain bg-transparent pointer-events-none"
            draggable={false}
          />
        </div>
        {/* <span className="text-xs sm:text-sm md:text-base text-center font-medium text-muted-foreground truncate max-w-full">
          {icon.name}
        </span> */}
      </div>
    </Card>
  );
};

interface IconGridProps {
  compact?: boolean;
  onIconClick?: (icon: Icon) => void;
}

const IconGrid: React.FC<IconGridProps> = ({ compact = false, onIconClick }) => {
  const [dragCount, setDragCount] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices and screen size
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const incrementDragCount = (iconId: string) => {
    setDragCount((prev) => ({
      ...prev,
      [iconId]: (prev[iconId] || 0) + 1,
    }));
  };

  const resetDragCount = (iconId: string) => {
    setDragCount((prev) => {
      const newCount = { ...prev };
      delete newCount[iconId];
      return newCount;
    });
  };

  const groupedIcons = iconsData.reduce((acc, icon) => {
    const category = icon.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(icon);
    return acc;
  }, {} as Record<string, Icon[]>);

  // Enhanced responsive grid columns with more breakpoints
  const gridCols = compact 
    ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" 
    : "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-10";

  // Enhanced responsive spacing
  const spacing = compact 
    ? "gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5" 
    : "gap-2 xs:gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 xl:gap-5";
  
  const containerSpacing = compact 
    ? "space-y-3 sm:space-y-4 md:space-y-5" 
    : "space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7";

  // Enhanced responsive padding
  const containerPadding = compact 
    ? 'p-2 xs:p-3 sm:p-4' 
    : 'p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8';

  return (
    <div className={`
      ${containerPadding} 
      ${containerSpacing} 
      overflow-hidden
      ${isMobile ? 'touch-pan-y' : ''}
    `}>
      {Object.entries(groupedIcons).map(([category, icons]) => (
        <div key={category} className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-1 sm:py-2">
            <Badge 
              variant="secondary" 
              className={`
                ${compact 
                  ? "text-xs px-2 py-1" 
                  : "text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
                }
                font-medium
              `}
            >
              {iconCategories[category as keyof typeof iconCategories]}
            </Badge>
            <span className={`
              ${compact 
                ? "text-xs" 
                : "text-xs sm:text-sm"
              } 
              text-muted-foreground font-medium
            `}>
              {icons.length} icons
            </span>
          </div>

          <div className={`
            grid ${gridCols} ${spacing} 
            max-w-full overflow-hidden
            ${isMobile ? 'auto-rows-min' : ''}
          `}>
            {icons.map((icon) => (
              <div key={icon.id} className="relative min-w-0 flex justify-center">
                <DraggableIcon 
                  icon={icon} 
                  onDragStart={incrementDragCount} 
                  compact={compact}
                  isMobile={isMobile}
                />
                {dragCount[icon.id] && dragCount[icon.id] > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex items-center gap-1 z-20">
                    <Badge
                      variant="secondary"
                      className={`
                        ${compact 
                          ? "h-5 w-5 sm:h-6 sm:w-6" 
                          : "h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8"
                        } 
                        rounded-full p-0 flex items-center justify-center 
                        text-xs font-bold
                        bg-blue-500 text-white hover:bg-blue-600 
                        cursor-pointer transition-colors
                        ${isMobile ? 'min-h-[24px] min-w-[24px]' : ''}
                        shadow-md border-2 border-white
                      `}
                      onClick={() => resetDragCount(icon.id)}
                      title={`Used ${dragCount[icon.id]} times. Click to reset counter.`}
                    >
                      {dragCount[icon.id]}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IconGrid;