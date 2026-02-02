
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModuleSize, Icon } from '@/types';
import { iconsData, iconCategories } from '@/data/icons';
import { useDraggable } from '@dnd-kit/core';

interface DraggableIconProps {
  icon: Icon;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ icon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: icon.id,
    data: {
      type: 'icon',
      icon,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 cursor-grab hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-accent'
      }`}
    >
      <div className="flex flex-col items-center space-y-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={icon.src}
            alt={icon.name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </Card>
  );
};

const IconGrid: React.FC = () => {
  const groupedIcons = iconsData.reduce((acc, icon) => {
    const category = icon.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(icon);
    return acc;
  }, {} as Record<string, Icon[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedIcons).map(([category, icons]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {iconCategories[category as keyof typeof iconCategories]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {icons.length}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {icons.map((icon) => (
              <DraggableIcon key={icon.id} icon={icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface SidebarProps {
  selectedSize: ModuleSize;
  onSizeChange: (size: ModuleSize) => void;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  selectedGlass: string;
  onGlassChange: (glass: string) => void;
  selectedFrame: string;
  onFrameChange: (frame: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSize,
  onSizeChange,
  selectedVariant,
  onVariantChange,
  selectedGlass,
  onGlassChange,
  selectedFrame,
  onFrameChange,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'icons'>('config');
  const sizes: ModuleSize[] = ['2', '4', '6', '8'];

  // Variants list depending on size
  const sizeVariants: Record<ModuleSize, string[]> = {
    '2': ['4 switches','2 curtains'],
    '4': [
      '8 switches',
      '4 switches + 1 Plug',
      '4 switches + fan'
    ],
    '6': [
      '10 Switch',
      '8 switch + 1 Plug',
      '4 switches + 1 fan + 1 Plug'
    ],
    '8': [
      '6 switches + 1 Fan + 1 Plug ',
      '10 switches + 1 Plug',
    ],
  };

  const glassOptions = ['Black','White'];
  const walloptions: string[] = [];


  useEffect(() => {
    const variants = sizeVariants[selectedSize];
    if (variants?.length > 0) {
      onVariantChange(variants[1]);
    }
  }, [selectedSize, onVariantChange]);

  return (
    <div className="w-120 h-full bg-card border-r border-border flex flex-col">
      <div className="p-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4">
          <Button
            variant={activeTab === 'config' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('config')}
          >
            Config
          </Button>
          <Button
            variant={activeTab === 'icons' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('icons')}
          >
            Icons
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-4">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              {/* Size Selection */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">📐 Size</h3>
                <div className="space-y-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onSizeChange(size)}
                    >
                      {size} Module
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Variant Selection */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">💎 Variant</h3>
                <div className="space-y-2">
                  {sizeVariants[selectedSize]?.map((variant) => (
                    <Button
                      key={variant}
                      variant={selectedVariant === variant ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onVariantChange(variant)}
                    >
                      {variant}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Glass Selection */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">Theme</h3>
                <div className="space-y-2">
                  {glassOptions.map((glass) => (
                    <Button
                      key={glass}
                      variant={selectedGlass === glass ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onGlassChange(glass)}
                    >
                      {glass}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Icon Library</h3>
              <p className="text-xs bg-transparent transform-none text-muted-foreground mb-4">
                Drag icons to the panel to customize your layout
              </p>
              <IconGrid />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;