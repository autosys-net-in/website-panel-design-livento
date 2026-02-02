import React, { useState, useCallback, forwardRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  X,
  Zap,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Power,
  Palette,
} from "lucide-react";
import { Icon, ModuleSize } from "@/types";
import SortableIconSlot from "./SortableIconSlot";
import "./Panel.css";
import o from "@/assest/curtains.png";
import p from "@/assest/smart-curtain.png";
import y from "@/assest/curtain.png";
import z from "@/assest/shower-curtains.png";
import x from "@/assest/wall-1.jpg";
import wall1 from "@/assest/wall-1.jpg";
import wall2 from "@/assest/wall-2.jpeg";
import wall3 from "@/assest/wall-3.jpeg";
import wall4 from "@/assest/walll-3.jpeg";
import wall5 from "@/assest/wall-5.jpeg";
import aa from "@/assest/www1.jpg";
import bb from "@/assest/www4.jpeg";
import cc from "@/assest/w3.jpeg";
import wall6 from "@/assest/mona-eendra-vC8wj_Kphak-unsplash.jpg";
import wall7 from "@/assest/danielle-suijkerbuijk-66ydMRXW-b8-unsplash.jpg";
import blue from "@/assest/lblue.jpeg";
import URLS from "../../config.js";
import dx from "../../assest/greg-rosenke-6QnEf_b47eA-unsplash.jpg"
import dy from "../../assest/joe-woods-4Zaq5xY5M_c-unsplash.jpg"
// Extended Icon interface for panel instances
interface PanelIcon extends Icon {
  instanceId: string;
}

interface TouchPanelPreviewProps {
  size: ModuleSize;
  variant: string;
  glass: string;
  frame: string;
  icons: (PanelIcon | null)[]; // Changed to slot-based array
  onRemoveIcon: (instanceId: string) => void;
  onIconsChange?: (icons: (PanelIcon | null)[]) => void;
  onPlaceIcon?: (icon: Icon, slotIndex: number) => void; // New prop for placing icons
  onMoveIcon?: (fromSlot: number, toSlot: number) => void; // New prop for moving icons
}

const TouchPanelPreview = forwardRef<HTMLDivElement, TouchPanelPreviewProps>(
  (
    {
      size,
      variant,
      glass,
      frame,
      icons: initialIcons,
      onRemoveIcon,
      onIconsChange,
      onPlaceIcon,
      onMoveIcon,
    },
    ref
  ) => {
    const [icons, setIcons] = useState<(PanelIcon | null)[]>([]);
    const [lastPanelConfig, setLastPanelConfig] = useState<string>("");
    const wallOptions = [blue, wall1, aa, wall7, wall6, dy, dx];
    const [selectedWall, setSelectedWall] = useState(wall1);
    
    // Set default icon color based on panel glass color
    const getDefaultIconColor = useCallback(() => {
      return glass === "White" ? false : true; // Black icons for white panel, white icons for black panel
    }, [glass]);
    
    const [isWhiteIcons, setIsWhiteIcons] = useState(getDefaultIconColor());

    // Update icon color when glass changes
    useEffect(() => {
      setIsWhiteIcons(getDefaultIconColor());
    }, [getDefaultIconColor]);

    // Function to get CSS filter based on icon color mode
    const getIconFilter = () => {
      return isWhiteIcons ? "brightness(0) invert(1)" : "brightness(0)";
    };

    // Get current icon color as RGB for display
    const getCurrentIconColorRGB = () => {
      return isWhiteIcons ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";
    };

    // Create a unique key for the current panel configuration (REMOVED glass parameter)
    const getCurrentPanelConfig = useCallback(() => {
      return `${size}-${variant}-${frame}`;
    }, [size, variant, frame]);

    // Reset icons when panel configuration changes
    useEffect(() => {
      const currentConfig = getCurrentPanelConfig();

      if (lastPanelConfig && lastPanelConfig !== currentConfig) {
        // Panel configuration changed - clear all icons
        const layoutConfig = getLayoutConfig();
        const totalSlots =
          layoutConfig.switchSlots +
          (layoutConfig.curtainSlots || 0) +
          (layoutConfig.fanSlots || 0) +
          (layoutConfig.plugSlots || 0);

        const emptyIcons = new Array(totalSlots).fill(null);
        setIcons(emptyIcons);

        // Notify parent component about the reset
        if (onIconsChange) {
          onIconsChange(emptyIcons);
        }

        // Remove all existing icons from parent state
        initialIcons.forEach((icon) => {
          if (icon) {
            onRemoveIcon(icon.instanceId);
          }
        });
      } else if (!lastPanelConfig) {
        // First load - use initial icons
        setIcons(initialIcons);
      }

      setLastPanelConfig(currentConfig);
    }, [
      size,
      variant,
      frame,
      getCurrentPanelConfig,
      lastPanelConfig,
      onIconsChange,
      onRemoveIcon,
    ]);

    // Update icons when initialIcons changes (but only if panel config hasn't changed)
    useEffect(() => {
      const currentConfig = getCurrentPanelConfig();
      if (lastPanelConfig === currentConfig) {
        setIcons(initialIcons);
      }
    }, [initialIcons, lastPanelConfig, getCurrentPanelConfig]);

    const handleDeleteIcon = useCallback(
      (instanceId: string) => {
        const updatedIcons = icons.map((icon) =>
          icon?.instanceId === instanceId ? null : icon
        );
        setIcons(updatedIcons);
        if (onIconsChange) onIconsChange(updatedIcons);
        onRemoveIcon(instanceId);
      },
      [icons, onRemoveIcon, onIconsChange]
    );

    const handleClearAllIcons = useCallback(() => {
      const clearedIcons = new Array(icons.length).fill(null);
      setIcons(clearedIcons);
      if (onIconsChange) onIconsChange(clearedIcons);

      // Remove all non-null icons
      icons.forEach((icon) => {
        if (icon) {
          onRemoveIcon(icon.instanceId);
        }
      });
    }, [icons, onRemoveIcon, onIconsChange]);

    // Get layout configuration based on size and variant - Made responsive
    const getLayoutConfig = () => {
      const hasPlug = variant.toLowerCase().includes("plug");
      const hasFans = variant.toLowerCase().includes("fan");
      const hasCurtains = variant.toLowerCase().includes("curtains");
      const theme = variant.toLowerCase().includes("theme");

      switch (size) {
        case "2":
          if (variant === "4 switches") {
            // 2x2 grid with 4 interactive switch slots
            return {
              cols: "grid-cols-2",
              rows: "grid-rows-2",
              // Responsive panel sizing
              panelSize:
                "w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[310px] md:h-[310px]",
              slotSize:
                "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]  border-none ",
              gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-10",
              fanGap:
                "gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-2 md:gap-x-5 md:gap-y-2",
              padding: "p-3 sm:p-4",
              switchSlots: 4,
              curtainSlots: 0,
              plugSlots: 0,
              fanSlots: 0,
              hasPlug: false,
              hasFans: false,
              hasCurtains: false,
            };
          } else if (variant === "2*2 curtains") {
            return {
              cols: "grid-cols-2",
              rows: "grid-rows-2",
              panelSize:
                "w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[310px] md:h-[310px]",
              slotSize:
                "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]  border-none ",
              curtainSize:
                "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]",
              gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-10",
              fanGap:
                "gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-2 md:gap-x-5 md:gap-y-2",
              padding: "p-3 sm:p-4",
              switchSlots: 0,
              plugSlots: 0,
              fanSlots: 0,
              hasPlug: false,
              hasFans: false,
              hasCurtains: true,
              slotIcons: {
                0: o,
                1: p,
                2: y,
                3: z,
              },
              curtainSlots: 4,
              isFullCurtainMode: true,
            };
          } else if (variant === "4 Switches + 2 curtains") {
            return {
              cols: "grid-cols-3",
              rows: "grid-rows-2",
              panelSize:
                "w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[350px] md:h-[350px]",
              slotSize:
                "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]",
              curtainSize:
                "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]",
              gap: "gap-x-2 gap-y-5 sm:gap-x-3 sm:gap-y-6 md:gap-x-4 md:gap-y-8",
              fanGap:
                "gap-x-2 gap-y-1 sm:gap-x-3 sm:gap-y-2 md:gap-x-4 md:gap-y-2",
              padding: "p-4 sm:p-5 md:p-6",
              switchSlots: 4,
              plugSlots: 0,
              fanSlots: 0,
              hasCurtains: true,
            };
          }
          // Default fallback for size "2"
          return {
            cols: "grid-cols-2",
            rows: "grid-rows-2",
            panelSize:
              "w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[310px] md:h-[310px]",
            slotSize:
              "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]  border-none ",
            curtainSize:
              "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]",
            gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-10",
            fanGap:
              "gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-2 md:gap-x-5 md:gap-y-2",
            padding: "p-3 sm:p-4",
            switchSlots: 0,
            plugSlots: 0,
            fanSlots: 0,
            hasPlug: false,
            hasFans: false,
            hasCurtains: true,
            slotIcons: {
              0: o,
              1: p,
              2: z,
              3: y,
            },
            curtainSlots: 4,
            isFullCurtainMode: true,
          };

        case "4":
          if (variant === "8 switches") {
            return {
              cols: "grid-cols-4",
              rows: "grid-rows-2",
              panelSize:
                "w-[350px] h-[240px] sm:w-[450px] sm:h-[280px] md:w-[520px] md:h-[300px]",
              slotSize:
                "w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]  border-none ",
              gap: "gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 md:gap-x-4 md:gap-y-12",
              fanGap:
                "gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 8,
              plugSlots: 0,
              fanSlots: 0,
            };
          } else if (variant === "4 switches + 1 plug") {
            return {
              cols: "grid-cols-2",
              rows: "grid-rows-2",
              panelSize:
                "w-[350px] h-[220px] sm:w-[450px] sm:h-[280px] md:w-[530px] md:h-[300px]",
              slotSize:
                "w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] border-none  ",
              plugSize:
                "w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[170px] md:h-[170px]",
              gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              fanGap:
                "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 4,
              plugSlots: 1,
              fanSlots: 0,
              hasPlug: true,
            };
          } else if (variant === "4 switches + fan") {
            return {
              cols: "grid-cols-2",
              rows: "grid-rows-2",
              panelSize:
                "w-[350px] h-[220px] sm:w-[450px] sm:h-[280px] md:w-[530px] md:h-[300px]",
              slotSize:
                "w-[35px] h-[35px] sm:w-[48px] sm:h-[48px] md:w-[55px] md:h-[55px]  border-none ",
              fanSize:
                "w-[35px] h-[35px] sm:w-[48px] sm:h-[48px] md:w-[55px] md:h-[55px]  border-none bg-transparent shadow-none ",
              gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              fanGap:
                "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 4,
              plugSlots: 0,
              fanSlots: 4,
              hasFans: true,
            };
          }

          return {
            cols: "grid-cols-2",
            rows: "grid-rows-2",
            panelSize:
              "w-[350px] h-[220px] sm:w-[450px] sm:h-[280px] md:w-[530px] md:h-[300px]",
            slotSize:
              "w-[38px] h-[38px] sm:w-[48px] sm:h-[48px] md:w-[58px] md:h-[58px]  border-none ",
            plugSize:
              "w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] border-none bg-transparent shadow-none",
            gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            fanGap:
              "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            padding: "p-4 sm:p-6 md:p-8",
            switchSlots: 4,
            plugSlots: 1,
            fanSlots: 0,
            hasPlug: true,
          };

        case "6":
          if (variant === "10 Switch") {
            return {
              cols: "grid-cols-5",
              rows: "grid-rows-2",
              panelSize:
                "w-[360px] h-[220px] sm:w-[580px] sm:h-[280px] md:w-[720px] md:h-[300px]",
              slotSize:
                "w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]  border-none ",
              gap: "gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 md:gap-x-4 md:gap-y-12",
              fanGap:
                "gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 10,
              plugSlots: 0,
              fanSlots: 0,
            };
          } else if (variant === "8 switch + 1 Plug") {
            return {
              cols: "grid-cols-4",
              rows: "grid-rows-2",
              panelSize:
                "w-[360px] h-[220px] sm:w-[580px] sm:h-[280px] md:w-[720px] md:h-[300px]",
              slotSize:
                "w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]  border-none ",
              plugSize:
                "w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[170px] md:h-[170px] border-none bg-transparent shadow-none",
              gap: "gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 md:gap-x-4 md:gap-y-12",
              fanGap:
                "gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 8,
              plugSlots: 1,
              fanSlots: 0,
              hasPlug: true,
            };
          } else if (variant === "4 switches + 1 fan + 1 Plug") {
            return {
              cols: "grid-cols-2",
              rows: "grid-rows-2",
              panelSize:
                "w-[360px] h-[220px] sm:w-[580px] sm:h-[280px] md:w-[720px] md:h-[300px]",
              slotSize:
                "w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px]  border-none ",
              plugSize:
                "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[157px] md:h-[155px] bg-transparent border-none shadow-none",
              fanSize:
                "w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px]  border-none ",
              gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              fanGap:
                "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
              padding: "p-4 sm:p-6 md:p-8",
              switchSlots: 4,
              plugSlots: 1,
              fanSlots: 4,
              hasPlug: true,
              hasFans: true,
            };
          }
          return {
            cols: "grid-cols-5",
            rows: "grid-rows-2",
            panelSize:
              "w-[360px] h-[220px] sm:w-[580px] sm:h-[280px] md:w-[720px] md:h-[300px]",
            slotSize:
              "w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]  border-none ",
            gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            fanGap:
              "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            padding: "p-6 sm:p-8 md:p-10",
            switchSlots: 10,
            plugSlots: 0,
            fanSlots: 0,
          };

        case "8":
          if (variant === "10 switches + 1 Plug") {
            return {
              cols: "grid-cols-5",
              rows: "grid-rows-2",
              panelSize:
                "w-[362px] h-[220px] sm:w-[620px] sm:h-[260px] md:w-[760px] md:h-[300px]",
              slotSize:
                "w-[32px] h-[32px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]  border-none bg-transparent shadow-none ",
              plugSize:
                "w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[170px] md:h-[170px] border-none bg-transparent shadow-none",
              gap: "gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 md:gap-x-4 md:gap-y-12 ",
              fanGap:
                "gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3",
              padding: "p-6 sm:p-8 md:p-12",
              switchSlots: 10,
              plugSlots: 1,
              fanSlots: 0,
              hasPlug: true,
              hasFans: false,
            };
          }
          return {
            cols: "grid-cols-3",
            rows: "grid-rows-2",
            panelSize:
              "w-[362px] h-[220px] sm:w-[620px] sm:h-[260px] md:w-[760px] md:h-[300px]",
            slotSize:
              "w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px]  border-none ",
            plugSize:
              "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[155px] md:h-[155px] border-none bg-transparent shadow-none",
            fanSize:
              "w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px]  border-none ",
            gap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            fanGap:
              "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 md:gap-y-12",
            padding: "p-6 sm:p-8 md:p-12",
            switchSlots: 6,
            plugSlots: 1,
            fanSlots: 4,
            hasFans: true,
            hasPlug: true,
          };

        default:
          return {
            cols: "grid-cols-2",
            rows: "grid-rows-2",
            panelSize:
              "w-[280px] h-[220px] sm:w-[360px] sm:h-[280px] md:w-[400px] md:h-[320px]",
            slotSize:
              "w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] md:w-[80px] md:h-[80px]",
            gap: "gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 md:gap-x-4 md:gap-y-10",
            fanGap:
              "gap-x-2 gap-y-1 sm:gap-x-3 sm:gap-y-2 md:gap-x-4 md:gap-y-2",
            padding: "p-4 sm:p-6 md:p-8",
            switchSlots: 4,
            plugSlots: 0,
            fanSlots: 0,
            curtainSlots: 0,
            hasPlug: false,
            hasFans: false,
            hasCurtains: false,
          };
      }
    };

    const getGlassEffect = () => {
      switch (glass) {
        case "Black":
          return {
            background: "linear-gradient(135deg, #1e1e1e 0%, #0d0d0d 100%)",
            overlay:
              "linear-gradient(150deg, rgba(255,255,255,0.05) 20%, transparent 70%)",
          };
        case "White":
          return {
            background: "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
            overlay:
              "linear-gradient(150deg, rgba(0,0,0,0) 0%, transparent 100%)",
          };
        default: // Default to Black if no valid option
          return {
            background: "linear-gradient(135deg, #1e1e1e 0%, #0d0d0d 100%)",
            overlay:
              "linear-gradient(150deg, rgba(255,255,255,0.05) 20%, transparent 70%)",
          };
      }
    };

    const getFrameStyle = () => {
      switch (frame) {
        case "Gold":
          return "border-amber-400 shadow-amber-400/20";
        case "Silver":
          return "border-gray-300 shadow-gray-300/20";
        case "White":
          return "border-white shadow-white/20";
        default: // Black
          return "border-gray-700 shadow-gray-700/20";
      }
    };

    const layoutConfig = getLayoutConfig();
    const glassEffect = getGlassEffect();
    const frameStyle = getFrameStyle();

    // Create individual droppable zones for each slot
    const SlotDropZone: React.FC<{
      slotIndex: number;
      children: React.ReactNode;
    }> = ({ slotIndex, children }) => {
      const { setNodeRef, isOver } = useDroppable({
        id: `slot-${slotIndex}`,
        data: { type: "slot", slotIndex },
      });

      return (
        <div
          ref={setNodeRef}
          className={`
          transition-all duration-200
          ${isOver ? "ring-2 ring-blue-400 ring-opacity-50 bg-blue-400/10" : ""}
        `}
        >
          {children}
        </div>
      );
    };

    // Render curtain section - Made responsive
    const renderCurtainSection = () => {
      if (!layoutConfig.hasCurtains) return null;

      const curtainStartIndex = layoutConfig.switchSlots;

      return (
        <div className="flex flex-col items-center justify-center ml-3 sm:ml-4 md:ml-6">
          <div className="flex flex-col space-y-2 sm:space-y-3">
            {Array.from(
              { length: layoutConfig.curtainSlots || 0 },
              (_, index) => {
                const slotIndex = curtainStartIndex + index;
                const icon = icons[slotIndex];

                return (
                  <SlotDropZone key={`curtain-${index}`} slotIndex={slotIndex}>
                    <div
                      className={`
                    relative flex flex-col items-center justify-between 
                    rounded-xl ${layoutConfig.curtainSize} group
                    transition-all duration-100
                    ${
                      icon
                        ? glass === "White"
                          ? "bg-black/10 border-2 border-black/20 shadow-lg"
                          : "bg-white/10 border-2 border-white/20 shadow-lg"
                        : glass === "White"
                        ? "border-2 border-black/10 border-dashed hover:border-black/30"
                        : "border-2 border-white/10 border-dashed hover:border-white/30"
                    }
                  `}
                    >
                      {icon ? (
                        <>
                          <SortableIconSlot
                            id={icon.instanceId}
                            icon={icon}
                            slotIndex={slotIndex}
                            onRemove={handleDeleteIcon}
                            isWhiteIcons={isWhiteIcons}
                          />
                          <button
                            onClick={() => handleDeleteIcon(icon.instanceId)}
                            className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 border border-white sm:border-2"
                            aria-label={`Delete ${icon.name || "curtain icon"}`}
                          >
                            <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                          </button>
                        </>
                      ) : (
                        <div
                          className={`flex flex-col items-center justify-center h-full py-2 sm:py-3 md:py-4 ${
                            glass === "White"
                              ? "text-black/50"
                              : "text-white/50"
                          }`}
                        >
                          {/* Curtain icon representation */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-0.5 sm:w-7 sm:h-0.5 md:w-8 md:h-1 rounded-full mb-1 sm:mb-1.5 md:mb-2 ${
                                glass === "White"
                                  ? "bg-black/40"
                                  : "bg-white/40"
                              }`}
                            ></div>
                            <div className="flex space-x-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-8 sm:w-1.5 sm:h-12 md:w-1.5 md:h-16 rounded-sm ${
                                    glass === "White"
                                      ? "bg-black/40"
                                      : "bg-white/40"
                                  }`}
                                ></div>
                              ))}
                            </div>
                            <div className="text-[8px] sm:text-[9px] md:text-[10px] font-medium mt-1 sm:mt-1.5 md:mt-2 text-center">
                              <br /> {index + 1}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </SlotDropZone>
                );
              }
            )}
          </div>
        </div>
      );
    };

    // Render fan section with 4 control slots - Made responsive
    const renderFanSection = () => {
      if (!layoutConfig.hasFans) return null;

      const fanStartIndex =
        layoutConfig.switchSlots + (layoutConfig.curtainSlots || 0);
      const fanControls = [
        {
          icon: "speed-up",
          label: "SPEED+",
          name: "fan-speed-up",
          customIcon: (
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                <div className="absolute inset-0 border-2 border-current rounded-full"></div>
                <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 sm:top-1 sm:left-1 sm:right-1 sm:bottom-1 md:top-1 md:left-1 md:right-1 md:bottom-1 flex items-center justify-center">
                  <ChevronUp className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2" />
                </div>
              </div>
            </div>
          ),
        },
        {
          icon: "oscillate",
          label: "OSC",
          name: "fan-oscillate",
          customIcon: (
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                <div className="absolute inset-0 border-2 border-current rounded-full"></div>
                <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 sm:top-1 sm:left-1 sm:right-1 sm:bottom-1 md:top-1 md:left-1 md:right-1 md:bottom-1 flex items-center justify-center">
                  <RotateCcw className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2" />
                </div>
              </div>
            </div>
          ),
        },
        {
          icon: "speed-down",
          label: "SPEED-",
          name: "fan-speed-down",
          customIcon: (
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                <div className="absolute inset-0 border-2 border-current rounded-full"></div>
                <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 sm:top-1 sm:left-1 sm:right-1 sm:bottom-1 md:top-1 md:left-1 md:right-1 md:bottom-1 flex items-center justify-center">
                  <ChevronDown className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2" />
                </div>
              </div>
            </div>
          ),
        },
        {
          icon: "power",
          label: "POWER",
          name: "fan-power",
          customIcon: (
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                <div className="absolute inset-0 border-2 border-current rounded-full"></div>
                <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 sm:top-1 sm:left-1 sm:right-1 sm:bottom-1 md:top-1 md:left-1 md:right-1 md:bottom-1 flex items-center justify-center">
                  <Power className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2" />
                </div>
              </div>
            </div>
          ),
        },
      ];

      return (
        <div className="flex flex-col items-center justify-center ml-3 sm:ml-4 md:ml-6">
          <div className={`grid grid-cols-2 ${layoutConfig.fanGap}`}>
            {fanControls.map((control, index) => {
              const slotIndex = fanStartIndex + index;
              const icon = icons[slotIndex];

              return (
                <SlotDropZone key={`fan-${index}`} slotIndex={slotIndex}>
                  <div
                    className={`
                    relative flex flex-col items-center justify-center 
                    rounded-xl w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px] group
                    transition-all duration-100 bg-transparent border-none shadow-none
                    ${
                      icon
                        ? glass === "White"
                          ? "bg-none border-none border-black/20 shadow-none"
                          : "bg-none border-none border-white/20 shadow-none"
                        : glass === "White"
                        ? "border-2 border-black/10 border-dashed hover:border-black/30"
                        : "border-2 border-white/10 border-dashed hover:border-white/30"
                    }
                  `}
                  >
                    {icon ? (
                      <>
                        <SortableIconSlot
                          id={icon.instanceId}
                          icon={icon}
                          slotIndex={slotIndex}
                          onRemove={handleDeleteIcon}
                          isWhiteIcons={isWhiteIcons}
                        />
                        <button
                          onClick={() => handleDeleteIcon(icon.instanceId)}
                          className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 border border-white sm:border-2"
                          aria-label={`Delete ${icon.name || "fan control"}`}
                        >
                          <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                        </button>
                      </>
                    ) : (
                      <div
                        className={`flex flex-col items-center justify-center ${
                          glass === "White" ? "text-black/50" : "text-white/50"
                        }`}
                      >
                        <div className="mb-0.5 sm:mb-1">
                          {control.customIcon}
                        </div>
                        <span className="text-[6px] sm:text-[7px] md:text-[8px] font-medium text-center leading-tight">
                          {control.label}
                        </span>
                      </div>
                    )}
                  </div>
                </SlotDropZone>
              );
            })}
          </div>
        </div>
      );
    };

    // Render plug section - Made responsive
    const renderPlugSection = () => {
      if (!layoutConfig.hasPlug) return null;

      const plugStartIndex =
        layoutConfig.switchSlots +
        (layoutConfig.curtainSlots || 0) +
        (layoutConfig.fanSlots || 0);

      const icon = icons[plugStartIndex];

      return (
        <div className="flex flex-col items-center justify-center ml-3 sm:ml-4 md:ml-6">
          <div
            className={`
              relative flex items-center justify-center 
              rounded-xl ${layoutConfig.plugSize} group
              transition-all duration-100 pointer-events-none
              ${
                glass === "White"
                  ? "bg-white border-2 border-black/30 shadow-lg"
                  : "bg-black border-2 border-white/30 shadow-lg"
              }
            `}
          >
            {icon ? (
              <>
                <SortableIconSlot
                  id={icon.instanceId}
                  icon={icon}
                  slotIndex={plugStartIndex}
                  onRemove={handleDeleteIcon}
                  isWhiteIcons={isWhiteIcons}
                />
                <button
                  onClick={() => handleDeleteIcon(icon.instanceId)}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 border border-white sm:border-2"
                  aria-label={`Delete ${icon.name || "plug"}`}
                >
                  <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                </button>
              </>
            ) : (
              <div className="w-16 h-16 sm:w-40 sm:h-40 md:w-27 md:h-27 flex items-center justify-center">
                <svg viewBox="0 0 140 120" className="w-full h-full">
                  <circle
                    cx="70"
                    cy="30"
                    r="15"
                    fill={glass === "White" ? "black" : "white"}
                  />
                  <circle
                    cx="35"
                    cy="95"
                    r="10"
                    fill={glass === "White" ? "black" : "white"}
                  />
                  <circle
                    cx="105"
                    cy="95"
                    r="10"
                    fill={glass === "White" ? "black" : "white"}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    };

    // Render switch slot with individual drop zone - Made responsive
    const renderSwitchSlot = (slotIndex: number) => {
      const icon = icons[slotIndex];
      const hardcodedIcon = layoutConfig.slotIcons?.[slotIndex];

      return (
        <SlotDropZone key={`slot-${slotIndex}`} slotIndex={slotIndex}>
          <div
            className={`
            relative flex items-center justify-center 
            rounded-xl ${layoutConfig.slotSize} group
            transition-all duration-100 bg-transparent border-none shadow-none
            ${
              icon || hardcodedIcon
                ? glass === "White"
                  ? "bg-none border-none border-black/20 shadow-none"
                  : "bg-none border-none border-white/20 shadow-none"
                : glass === "White"
                ? "border-2 border-black/10 border-dashed hover:border-black/30"
                : "border-2 border-white/10 border-dashed hover:border-white/30"
            }
          `}
          >
            {/* Show hardcoded icon if present and no user icon */}
            {hardcodedIcon && !icon ? (
              <div
                className={`flex flex-col items-center justify-center ${
                  glass === "White" ? "text-black/90" : "text-white/90"
                }`}
              >
                <img
                  src={hardcodedIcon}
                  alt={`Curtain ${slotIndex + 1}`}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain mb-0.5 sm:mb-1"
                  style={{
                    filter: getIconFilter(),
                  }}
                />
                <span className="text-[6px] sm:text-[7px] md:text-[8px] font-medium text-center">
                  CURTAIN {slotIndex + 1}
                </span>
              </div>
            ) : icon ? (
              <>
                <SortableIconSlot
                  id={icon.instanceId}
                  icon={icon}
                  slotIndex={slotIndex}
                  onRemove={handleDeleteIcon}
                  isWhiteIcons={isWhiteIcons}
                />
                {/* Hover delete button */}
                <button
                  onClick={() => handleDeleteIcon(icon.instanceId)}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 border border-white sm:border-2"
                  aria-label={`Delete ${icon.name || "icon"}`}
                >
                  <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                </button>
              </>
            ) : (
              <div
                className={`flex flex-col items-center ${
                  glass === "White" ? "text-black/30" : "text-white/30"
                }`}
              >
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mb-0.5 sm:mb-1 text-yellow-500 " />
                <span className="text-[6px] sm:text-[8px] md:text-[10px] font-medium">
                  {/* {slotIndex + 1} */}
                </span>
              </div>
            )}
          </div>
        </SlotDropZone>
      );
    };

    // Render main grid with proper handling for curtain mode - Made responsive
    const renderMainGrid = () => {
      const totalSlots = layoutConfig.isFullCurtainMode
        ? layoutConfig.curtainSlots
        : layoutConfig.switchSlots;

      return (
        <div
          className={`grid ${layoutConfig.cols} ${layoutConfig.rows} ${layoutConfig.gap} place-items-center`}
        >
          {Array.from({ length: totalSlots }, (_, index) => {
            if (layoutConfig.isFullCurtainMode) {
              // In full curtain mode, render hardcoded curtain icons
              const hardcodedIcon = layoutConfig.slotIcons?.[index];
              return (
                <div
                  key={`curtain-${index}`}
                  className={`relative flex items-center justify-center rounded-xl w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px] border-2 shadow-none bg-transparent border-none ${
                    glass === "White"
                      ? "bg-black/10 border-black/20"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center justify-center bg-transparent shadow-none border-none ${
                      glass === "White" ? "text-black/90" : "text-white/90"
                    }`}
                  >
                    <img
                      src={hardcodedIcon}
                      alt={`Curtain ${index + 1}`}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain mb-0.5 sm:mb-1"
                      style={{
                        filter: getIconFilter(),
                      }}
                    />
                    <span className="text-[6px] sm:text-[7px] md:text-[8px] font-medium text-center"></span>
                  </div>
                </div>
              );
            } else {
              // Regular switch slots
              return renderSwitchSlot(index);
            }
          })}
        </div>
      );
    };

    // Count active (non-null) icons
    const activeIconCount = icons.filter((icon) => icon !== null).length;

    return (
      <div
        ref={ref}
        data-panel-container="true"
        style={{
          backgroundImage: selectedWall ? `url(${selectedWall})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: selectedWall ? "transparent" : "#ADD8E6", // Light blue fallback
        }}
        className="space-y-4 sm:space-y-6 md:space-y-8 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8"
      >
        {/* Icon Color Toggle - Positioned at top left with RGB display */}
        <div className="fixed top-3 left-40 md:top-3 md:left-40 lg:top-3 lg:left-48 z-50">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWhiteIcons(!isWhiteIcons)}
            className="flex items-center justify-center gap-2  hover:bg-blue-100 shadow-lg bg-transparent rounded-2xl px-3 py-2"
            title={`Current icon color: ${getCurrentIconColorRGB()}`}
          >
            <Palette className="w-4 h-4" /> */}
            {/* Color box with RGB value */}
            {/* <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: isWhiteIcons ? "#ffffff" : "#000000" }}
              /> */}
              {/* <span className="text-xs font-mono text-gray-600">
                {isWhiteIcons ? "255,255,255" : "0,0,0"}
              </span>
            </div>
          </Button> */}
        </div>

        {/* Wall Selection - Positioned at right side */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          {wallOptions.map((wall, index) => (
            <button
              key={index}
              onClick={() => setSelectedWall(wall)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl sm:rounded-3xl overflow-hidden border-2 transition 
        ${selectedWall === wall ? "border-blue-500" : "border-transparent"}`}
            >
              <img
                src={wall}
                alt={`Wall ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Panel Info and Clear Button */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center -mt-16 sm:-mt-20 md:-mt-24 px-20">
          {activeIconCount > 0 && !layoutConfig.isFullCurtainMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllIcons}
              className="flex items-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 hover:border-red-300 text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>

        {/* Touch Panel */}
        <div className="relative">
          {/* Outer frame/bezel */}
          <div
            className={`rounded-xl sm:rounded-2xl md:rounded-[2rem] ${frameStyle} border-none p-1 sm:p-1.5 md:p-2 -mt-4 sm:-mt-6 md:-mt-8 shadow-none sm:shadow-none`}
          >
            <Card className="rounded-lg sm:rounded-xl md:rounded-[1.5rem] overflow-hidden border-0 shadow-inner">
              <div
                className={`
                relative rounded-lg sm:rounded-xl md:rounded-[1.5rem] overflow-hidden
                flex items-center justify-center
                ${layoutConfig.panelSize}
                transition-all duration-200
              `}
                style={{ background: glassEffect.background }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg sm:rounded-xl md:rounded-[1.5rem]"
                  style={{ background: glassEffect.overlay }}
                />

                {/* Subtle grid pattern - Responsive */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `
                    linear-gradient(90deg, ${
                      glass === "White"
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.1)"
                    } 1px, transparent 1px),
                    linear-gradient(${
                      glass === "White"
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.1)"
                    } 1px, transparent 1px)
                  `,
                    backgroundSize: "15px 15px sm:18px 18px md:20px 20px",
                  }}
                />

                {/* Main content area with switches and other components */}
                <SortableContext
                  items={icons
                    .filter((icon) => icon !== null)
                    .map((icon) => icon!.instanceId)}
                  strategy={rectSortingStrategy}
                >
                  <div
                    className={`w-full h-full ${layoutConfig.padding} flex items-center justify-center relative z-10`}
                  >
                    <div className="flex items-center justify-center">
                      {/* Main Grid */}
                      {renderMainGrid()}

                      {/* Curtain Section - Only show if not in full curtain mode */}
                      {!layoutConfig.isFullCurtainMode &&
                        renderCurtainSection()}

                      {/* Fan Section */}
                      {renderFanSection()}

                      {/* Plug Section */}
                      {renderPlugSection()}
                    </div>
                  </div>
                </SortableContext>

                {/* Responsive Brand logo on panel */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-3 md:bottom-4 md:right-4 z-10">
                  <img
                    src={"/assest/logo.png"}
                    alt="Livento Logo"
                    className="w-4 h-auto sm:w-10 md:w-16 object-contain opacity-100"
                    style={{
                      filter: getIconFilter(),
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Brand logo at bottom right of screen */}
        <div className="absolute bottom-8 right-2 sm:bottom-4 sm:right-3 md:bottom-3 md:right-4 z-10">
          <img
            src={"/assest/logo.png"}
            alt="Livento Logo"
            className="w-22 h-8 sm:w-30 sm:h-25 md:w-31 md:h-31 object-contain opacity-100"
            style={{
              filter: getIconFilter(),
            }}
          />
        </div>
      </div>
    );
  }
);

TouchPanelPreview.displayName = "TouchPanelPreview";

export default TouchPanelPreview;