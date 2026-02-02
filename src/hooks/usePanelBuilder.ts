import { useState, useCallback } from 'react';
import { Icon, ModuleSize, BuilderState } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Extended Icon interface for panel instances
interface PanelIcon extends Icon {
  instanceId: string; // Unique identifier for each icon instance
}

// Updated BuilderState to use PanelIcon with slot-based storage
interface ExtendedBuilderState extends Omit<BuilderState, 'selectedIcons'> {
  selectedIcons: (PanelIcon | null)[]; // Array where index = slot position, null = empty slot
}

const usePanelBuilder = () => {
  const { toast } = useToast();
  
  // Initialize with empty slots based on default size
  const getEmptySlots = (size: string) => {
    const slotCount = getSlotCount(size);
    return new Array(slotCount).fill(null);
  };

  const getSlotCount = (size: string) => {
    switch (size) {
      case '2': return 4;
      case '4': return 8;
      case '6': return 10;
      case '8': return 10;
      default: return 4;
    }
  };
  
  const [builderState, setBuilderState] = useState<ExtendedBuilderState>({
    selectedSize: '4',
    selectedVariant: 'Standard',
    selectedGlass: 'Clear',
    selectedFrame: 'Silver',
    selectedIcons: getEmptySlots('4'),
  });

  const generateInstanceId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const updateSize = useCallback((size: ModuleSize) => {
    setBuilderState(prev => {
      const newSlotCount = getSlotCount(size);
      const oldSlotCount = prev.selectedIcons.length;
      
      let newIcons: (PanelIcon | null)[];
      
      if (newSlotCount > oldSlotCount) {
        // Expanding: keep existing icons and add empty slots
        newIcons = [...prev.selectedIcons, ...new Array(newSlotCount - oldSlotCount).fill(null)];
      } else if (newSlotCount < oldSlotCount) {
        // Shrinking: keep only the first newSlotCount icons
        newIcons = prev.selectedIcons.slice(0, newSlotCount);
        const removedIcons = prev.selectedIcons.slice(newSlotCount).filter(icon => icon !== null);
        
        if (removedIcons.length > 0) {
          toast({
            title: "Icons Removed",
            description: `Panel size reduced. ${removedIcons.length} icons were removed.`,
            variant: "destructive",
          });
        }
      } else {
        // Same size, no change needed
        newIcons = prev.selectedIcons;
      }
      
      return {
        ...prev,
        selectedSize: size,
        selectedIcons: newIcons,
      };
    });
  }, [toast]);

  const updateVariant = useCallback((variant: string) => {
    setBuilderState(prev => ({ ...prev, selectedVariant: variant }));
  }, []);

  const updateGlass = useCallback((glass: string) => {
    setBuilderState(prev => ({ ...prev, selectedGlass: glass }));
  }, []);

  const updateFrame = useCallback((frame: string) => {
    setBuilderState(prev => ({ ...prev, selectedFrame: frame }));
  }, []);
//  const updateFrame = useCallback((frame: string) => {
//     setBuilderState(prev => ({ ...prev, selectedFrame: frame }));
//   }, []);
  const addIcon = useCallback((icon: Icon, targetSlot?: number) => {
    setBuilderState(prev => {
      const newIcons = [...prev.selectedIcons];
      
      // Create a new instance with unique ID
      const panelIcon: PanelIcon = {
        ...icon,
        instanceId: generateInstanceId(),
      };

      // If targetSlot is specified, place icon there
      if (targetSlot !== undefined && targetSlot >= 0 && targetSlot < newIcons.length-2) {
        newIcons[targetSlot] = panelIcon;
      } else {
        // Find first empty slot
        const emptySlotIndex = newIcons.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) {
          toast({
            title: "Panel Full",
            description: `All slots are occupied. Remove an icon first or select a specific slot.`,
            variant: "destructive",
          });
          return prev;
        }
        newIcons[emptySlotIndex] = panelIcon;
      }

      toast({
        title: "Icon Added",
        description: `${icon.name} has been added to your panel.`,
      });

      return {
        ...prev,
        selectedIcons: newIcons,
      };
    });
  }, [toast]);

  const removeIcon = useCallback((instanceId: string) => {
    setBuilderState(prev => {
      const newIcons = [...prev.selectedIcons];
      const iconIndex = newIcons.findIndex(icon => icon?.instanceId === instanceId);
      
      if (iconIndex !== -1 && newIcons[iconIndex]) {
        const removedIcon = newIcons[iconIndex];
        newIcons[iconIndex] = null; // Set slot to empty instead of removing
        
        toast({
          title: "Icon Removed",
          description: `${removedIcon!.name} has been removed from your panel.`,
        });
      }
      
      return {
        ...prev,
        selectedIcons: newIcons,
      };
    });
  }, [toast]);

  const moveIcon = useCallback((fromSlot: number, toSlot: number) => {
    setBuilderState(prev => {
      if (fromSlot === toSlot || fromSlot < 0 || toSlot < 0 || 
          fromSlot >= prev.selectedIcons.length || toSlot >= prev.selectedIcons.length) {
        return prev;
      }

      const newIcons = [...prev.selectedIcons];
      const iconToMove = newIcons[fromSlot];
      
      if (!iconToMove) return prev; // No icon to move
      
      // Swap the icons
      newIcons[fromSlot] = newIcons[toSlot];
      newIcons[toSlot] = iconToMove;

      return {
        ...prev,
        selectedIcons: newIcons,
      };
    });
  }, []);

  const placeIconInSlot = useCallback((icon: Icon, slotIndex: number) => {
    setBuilderState(prev => {
      if (slotIndex < 0 || slotIndex >= prev.selectedIcons.length) {
        return prev; // Invalid slot
      }

      const newIcons = [...prev.selectedIcons];
      const panelIcon: PanelIcon = {
        ...icon,
        instanceId: generateInstanceId(),
      };

      // If slot is occupied, show warning
      if (newIcons[slotIndex] !== null) {
        toast({
          title: "Slot Occupied",
          description: `Slot ${slotIndex + 1} is already occupied. The existing icon will be replaced.`,
          variant: "default",
        });
      }

      newIcons[slotIndex] = panelIcon;

      toast({
        title: "Icon Placed",
        description: `${icon.name} has been placed in slot ${slotIndex + 1}.`,
      });

      return {
        ...prev,
        selectedIcons: newIcons,
      };
    });
  }, [toast]);

  // Helper to get non-null icons for backward compatibility
  const getActiveIcons = useCallback(() => {
    return builderState.selectedIcons.filter(icon => icon !== null) as PanelIcon[];
  }, [builderState.selectedIcons]);

  return {
    builderState,
    updateSize,
    updateVariant,
    updateGlass,
    updateFrame,
    addIcon,
    removeIcon,
    moveIcon,
    placeIconInSlot,
    getActiveIcons,
  };
};

export default usePanelBuilder;