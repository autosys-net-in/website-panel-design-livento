import React, { useState, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import IconGrid, { IconDragOverlay } from "@/components/icons/IconGrid";
import TouchPanelPreview from "@/components/panel/TouchPanelPreview";
import usePanelBuilder from "@/hooks/usePanelBuilder";
import { Icon } from "@/types";
import { iconsData } from "@/data/icons";
import { generatePanelPDF } from "@/utils/pdfGenerator";

// Extended Icon interface for panel instances
interface PanelIcon extends Icon {
  instanceId: string;
}

const Index = () => {
  const [activeIcon, setActiveIcon] = useState<Icon | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    builderState,
    updateSize,
    updateVariant,
    updateGlass,
    updateFrame,
    addIcon,
    removeIcon,
    moveIcon,
    placeIconInSlot,
  } = usePanelBuilder();

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (activeData?.type === "icon") {
      setActiveIcon(activeData.icon as Icon);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for better UX - could add visual feedback here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIcon(null); // Clear the active icon

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle dropping icon from grid to specific slot
    if (activeData?.type === "icon" && overData?.type === "slot") {
      const icon = activeData.icon as Icon;
      const targetSlot = overData.slotIndex;
      placeIconInSlot(icon, targetSlot);
      return;
    }

    // Handle dropping icon from grid to panel (find first empty slot)
    if (activeData?.type === "icon" && over.id === "panel-dropzone") {
      const icon = activeData.icon as Icon;
      addIcon(icon);
      return;
    }

    // Handle moving icons between slots within panel
    if (activeData?.type === "panel-icon" && overData?.type === "slot") {
      const fromSlotIndex = activeData.slotIndex;
      const toSlotIndex = overData.slotIndex;

      if (fromSlotIndex !== toSlotIndex) {
        moveIcon(fromSlotIndex, toSlotIndex);
      }
      return;
    }

    // Handle reordering icons within panel (drag icon onto another icon)
    if (activeData?.type === "panel-icon" && overData?.type === "panel-icon") {
      const fromSlotIndex = activeData.slotIndex;
      const toSlotIndex = overData.slotIndex;

      if (fromSlotIndex !== toSlotIndex) {
        moveIcon(fromSlotIndex, toSlotIndex);
      }
    }
  };

  const handleDownloadPDF = async (): Promise<void> => {
    try {
      await generatePanelPDF({
        size: builderState.selectedSize,
        variant: builderState.selectedVariant,
        glass: builderState.selectedGlass,
        frame: builderState.selectedFrame,
        icons: builderState.selectedIcons,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw error; // Re-throw to let Header handle the error display
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-background">
        <Header onDownloadPDF={handleDownloadPDF} />

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Config Sidebar */}
            <ResizablePanel defaultSize={16} minSize={16} maxSize={25}>
              <Sidebar
                selectedSize={builderState.selectedSize}
                onSizeChange={updateSize}
                selectedVariant={builderState.selectedVariant}
                onVariantChange={updateVariant}
                selectedGlass={builderState.selectedGlass}
                onGlassChange={updateGlass}
                selectedFrame={builderState.selectedFrame}
                onFrameChange={updateFrame}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            {/* Touch Panel Preview - Main Area */}
            <ResizablePanel defaultSize={64} minSize={60}>
              <div className="p-0">
                <TouchPanelPreview
                  ref={panelRef}
                  size={builderState.selectedSize}
                  variant={builderState.selectedVariant}
                  glass={builderState.selectedGlass}
                  frame={builderState.selectedFrame}
                  icons={builderState.selectedIcons}
                  onRemoveIcon={removeIcon}
                  onPlaceIcon={placeIconInSlot}
                  onMoveIcon={moveIcon}
                />
              </div>
              {/* </ScrollArea> */}
            </ResizablePanel>

            {/* <ResizableHandle withHandle /> */}

            {/* Icons Panel */}
            {/* <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Available Icons</h3>
                  <IconGrid 
                    icons={iconsData} 
                    onIconClick={addIcon}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel> */}
          </ResizablePanelGroup>
        </div>

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            duration: 0,
            easing: "linear", // No acceleration or bounce
          }}
        >
          {activeIcon && <IconDragOverlay icon={activeIcon} />}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Index;
