import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Icon } from "@/types";

// Extended Icon interface for panel instances
interface PanelIcon extends Icon {
  instanceId: string;
}

interface SortableIconSlotProps {
  id: string; // This will be the instanceId
  icon?: PanelIcon;
  slotIndex: number;
  onRemove: (instanceId: string) => void;
  isWhiteIcons?: boolean; // Simplified prop for white/black toggle
}

const SortableIconSlot: React.FC<SortableIconSlotProps> = ({
  id,
  icon,
  slotIndex,
  onRemove,
  isWhiteIcons = true, // Default to white icons
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id, // Use instanceId as the sortable ID
    data: { type: "panel-icon", icon, slotIndex },
    disabled: !icon,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : "auto",
    position: isDragging ? "relative" : "static",
    opacity: isDragging ? 0.6 : 1,
    cursor: icon ? "grab" : "default",
  } as React.CSSProperties;

  // Simple function to get CSS filter for white or black icons
  const getIconFilter = () => {
    return isWhiteIcons ? "brightness(0) invert(1)" : "brightness(0)";
  };

  if (!icon) {
    return (
      <Card className="h-full min-h-[48px] sm:min-h-[60px] md:min-h-[72px] flex items-center justify-center bg-transparent shadow-none border-none">
        <span className="text-xs text-muted-foreground">Empty Slot</span>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-full min-h-[48px] sm:min-h-[60px] md:min-h-[72px] p-1 sm:p-2 transition-all duration-100 relative group bg-transparent shadow-none border-none hover:bg-white/5 touch-manipulation"
    >
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-sm flex items-center justify-center aspect-square">
          {icon.src ? (
            <img
              src={icon.src}
              alt={icon.name}
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
              style={{
                filter: getIconFilter(),
                transition: 'filter 0.2s ease-in-out',
              }}
            />
          ) : (
            <span 
              className="text-sm xs:text-base sm:text-lg md:text-xl"
              style={{
                filter: getIconFilter(),
                transition: 'filter 0.2s ease-in-out',
              }}
            >
              💡
            </span>
          )}
        </div>
      </div>

      {/* Responsive Tooltip - Hidden on touch devices, shown on hover for desktop
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden sm:block">
        {icon.name}
      </div> */}
      
      {/* Mobile-friendly label - Only visible on small screens */}
      {/* <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-75 sm:hidden pointer-events-none whitespace-nowrap truncate max-w-[60px] text-center">
        {icon.name}
      </div> */}
    </Card>
  );
};

export default SortableIconSlot;