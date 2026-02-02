import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ModuleSize } from '@/types';
import logo from '@/assest/logo.png'

interface PanelIcon {
  instanceId: string;
  name: string;
  src?: string;
  category?: string;
}

interface PDFGeneratorOptions {
  size: ModuleSize;
  variant: string;
  glass: string;
  frame: string;
  icons: (PanelIcon | null)[];
}

// Logo position configurations for different module sizes
const LOGO_POSITIONS = {
  '2': {
    width: 25,
    height: 6,
    offsetX: 27,  // horizontal offset from center
    offsetY: 30  // vertical offset from center (positive = down)
  },
  '4': {
    width: 30,
    height: 7,
    offsetX: 52,
    offsetY: 30
  },
  '6': {
    width: 35,
    height: 8,
    offsetX: 62,
    offsetY: 30
  },
  '8': {
    width: 40,
    height: 9,
    offsetX: 85,
    offsetY: 30
  }
};

// Function to determine if panel background is dark or light
const isPanelDark = (panelElement: Element): boolean => {
  const computedStyle = window.getComputedStyle(panelElement);
  const backgroundColor = computedStyle.backgroundColor;
  
  // If background color is transparent or not set, check for background image
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    // You might need to adjust this logic based on your wall/background variants
    // For now, we'll check if the variant or class names suggest a dark background
    const classList = panelElement.classList.toString().toLowerCase();
    const variant = panelElement.getAttribute('data-variant')?.toLowerCase() || '';
    
    // Add your specific logic here based on how you determine dark/light panels
    return classList.includes('dark') || variant.includes('black') || classList.includes('black');
  }
  
  // Parse RGB values from backgroundColor
  const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    // Calculate luminance to determine if color is dark or light
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5; // Dark if luminance is less than 50%
  }
  
  // Default to light background
  return false;
};

// Function to create an adaptive shiny logo - ultra-shiny for dark panels, subtle for white panels
const createShinyLogo = (logoImg: HTMLImageElement, isDark: boolean): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Adjust canvas padding based on panel type
  const padding = isDark ? 10 : 5; // Less padding for white panels
canvas.width  = logoImg.naturalWidth  + padding * 2;
canvas.height = logoImg.naturalHeight + padding * 2;
  
  // Draw the original logo with padding
  ctx.drawImage(logoImg, padding, padding);
  
  // Create base metallic gradient with adaptive intensity
  const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  
  if (isDark) {
    // Ultra-bright chrome effect for dark panels
    baseGradient.addColorStop(0, '#ffffff');      // Pure white highlight
    baseGradient.addColorStop(0.15, '#f8f8f8');   // Bright silver
    baseGradient.addColorStop(0.35, '#e0e0e0');   // Light chrome
    baseGradient.addColorStop(0.5, '#ffffff');    // Mid bright highlight
    baseGradient.addColorStop(0.65, '#d8d8d8');   // Chrome silver
    baseGradient.addColorStop(0.85, '#f0f0f0');   // Bright reflection
    baseGradient.addColorStop(1, '#e8e8e8');      // Bottom shine
  } else {
    // Subtle dark gradient for white/light panels - much less contrast
    baseGradient.addColorStop(0, '#4a4a4a');      // Medium gray (not too dark)
    baseGradient.addColorStop(0.15, '#404040');   // Slightly darker
    baseGradient.addColorStop(0.35, '#383838');   // Subtle variation
    baseGradient.addColorStop(0.5, '#424242');    // Minimal highlight
    baseGradient.addColorStop(0.65, '#3e3e3e');   // Subtle depth
    baseGradient.addColorStop(0.85, '#454545');   // Very subtle reflection
    baseGradient.addColorStop(1, '#404040');      // Bottom tone
  }
  
  // Apply base metallic gradient
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add primary diagonal shine streak with adaptive intensity
  ctx.globalCompositeOperation = 'source-atop';
  const primaryShine = ctx.createLinearGradient(
    canvas.width * 0.2, 0, 
    canvas.width * 0.8, canvas.height * 0.6
  );
  
  if (isDark) {
    // Dramatic shine for dark panels
    primaryShine.addColorStop(0, 'rgba(255, 255, 255, 0.9)');   // Ultra-bright shine
    primaryShine.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)'); // Strong shine
    primaryShine.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)'); // Medium shine
    primaryShine.addColorStop(1, 'rgba(255, 255, 255, 0)');     // Fade out
  } else {
    // Very subtle shine for white panels
    primaryShine.addColorStop(0, 'rgba(255, 255, 255, 0.15)');  // Minimal shine
    primaryShine.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)'); // Very subtle
    primaryShine.addColorStop(0.6, 'rgba(255, 255, 255, 0.03)'); // Barely visible
    primaryShine.addColorStop(1, 'rgba(255, 255, 255, 0)');      // Fade out
  }
  
  ctx.fillStyle = primaryShine;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add secondary horizontal shine band (only for dark panels)
  if (isDark) {
    const horizontalShine = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height * 0.7);
    
    horizontalShine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    horizontalShine.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    horizontalShine.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)'); // Bright horizontal band
    horizontalShine.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    horizontalShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = horizontalShine;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Very minimal horizontal shine for white panels
    const horizontalShine = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height * 0.6);
    
    horizontalShine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    horizontalShine.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
    horizontalShine.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)'); // Very subtle band
    horizontalShine.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
    horizontalShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = horizontalShine;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Add edge highlights - dramatic for dark, minimal for white
  const edgeHighlight = ctx.createRadialGradient(
    canvas.width * 0.7, canvas.height * 0.3, 0,
    canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.6
  );
  
  if (isDark) {
    edgeHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)'); // Bright center
    edgeHighlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)'); // Medium glow
    edgeHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to transparent
  } else {
    edgeHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.08)'); // Very subtle center
    edgeHighlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)'); // Barely visible glow
    edgeHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to transparent
  }
  
  ctx.fillStyle = edgeHighlight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add final specular highlight - ONLY for dark panels
  if (isDark) {
    const specular = ctx.createRadialGradient(
      canvas.width * 0.6, canvas.height * 0.25, 0,
      canvas.width * 0.6, canvas.height * 0.25, canvas.width * 0.2
    );
    specular.addColorStop(0, 'rgba(255, 255, 255, 1)');     // Pure white center
    specular.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)'); // Bright falloff
    specular.addColorStop(1, 'rgba(255, 255, 255, 0)');     // Transparent edge
    
    ctx.fillStyle = specular;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas.toDataURL('image/png');
};

export const generatePanelPDF = async (options: PDFGeneratorOptions): Promise<void> => {
  const { size, variant, glass, frame, icons } = options;

  // Find the panel container element
  const panelElement = document.querySelector('[data-panel-container]');
  if (!panelElement) {
    throw new Error('Panel container not found. Make sure the panel has data-panel-container="true" attribute.');
  }

  try {
    // Determine if panel has dark background
    const isDarkPanel = isPanelDark(panelElement);

    // Store references to UI elements that should be hidden in PDF
    const wallSelectionButtons = document.querySelector('.fixed.right-6');
    const clearAllSection = document.querySelector('.flex.flex-wrap.gap-2');
    const colorToggleButton = document.querySelector('.fixed.top-3');

    // Store original visibility states
    const originalStates: { element: HTMLElement; visibility: string; display: string }[] = [];
    
    // Temporarily hide UI elements for PDF capture
    [wallSelectionButtons, clearAllSection, colorToggleButton].forEach(element => {
      if (element && element instanceof HTMLElement) {
        originalStates.push({
          element,
          visibility: element.style.visibility || '',
          display: element.style.display || ''
        });
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      }
    });

    // Wait a moment for DOM updates
    await new Promise(resolve => setTimeout(resolve, 50));

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(panelElement as HTMLElement, {
      backgroundColor: null, // Keep original background (wall texture)
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: panelElement.scrollWidth,
      height: panelElement.scrollHeight,
    });

    // Immediately restore original visibility states
    originalStates.forEach(({ element, visibility, display }) => {
      element.style.visibility = visibility;
      element.style.display = display;
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit the page
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

   const imgWidth = canvas.width;
const imgHeight = canvas.height;

const pxToMm = 0.264583;

const imgWidthMm  = canvas.width  * pxToMm;
const imgHeightMm = canvas.height * pxToMm;

const ratio = Math.min(
  pdfWidth / imgWidthMm,
  pdfHeight / imgHeightMm
);

const scaledWidth  = imgWidthMm  * ratio;
const scaledHeight = imgHeightMm * ratio;

const x = (pdfWidth  - scaledWidth)  / 2;
const y = (pdfHeight - scaledHeight) / 2;

    // Add the panel image
    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

    // Get logo configuration for current module size
    const logoConfig = LOGO_POSITIONS[size as keyof typeof LOGO_POSITIONS];
    
    if (logoConfig) {
      // Calculate watermark logo position based on module size
      const watermarkX = x + (scaledWidth - logoConfig.width) / 2 + logoConfig.offsetX;
      const watermarkY = y + (scaledHeight - logoConfig.height) / 2 + logoConfig.offsetY;

      // Load logo and create shiny version
      const logoImg = new Image();
      
      logoImg.onload = () => {
        // Create shiny logo version for watermark
        const shinyLogoData = createShinyLogo(logoImg, isDarkPanel);
        
        // Add shiny watermark logo to PDF
        // pdf.addImage(shinyLogoData, 'PNG', watermarkX+5, watermarkY, 20, 10);
        
        // Continue with the rest of the PDF generation
        finalizePDF();
      };
      
      logoImg.src = logo;
    } else {
      // Fallback for unsupported module sizes with shiny logo
      console.warn(`No logo position configuration found for module size: ${size}`);
      const fallbackWidth = 15;
      const fallbackHeight = 7;
      const fallbackX = x + (scaledWidth - fallbackWidth) / 2;
      const fallbackY = y + (scaledHeight - fallbackHeight) / 2 + 35;
      
      const logoImg = new Image();
      
      logoImg.onload = () => {
        const shinyLogoData = createShinyLogo(logoImg, isDarkPanel);
        pdf.addImage(shinyLogoData, 'PNG', fallbackX, fallbackY, fallbackWidth, fallbackHeight);
        
        finalizePDF();
      };
      
      logoImg.src = logo;
    }

    // Function to complete PDF generation
    const finalizePDF = () => {

      // Add header with logo centered and panel information on the right
      const headerY = 8; // Top margin
      const logoWidth = 20;
      const logoHeight = 10;
      const logoX = (pdfWidth - logoWidth) / 2; // Center the logo
      
      // Add logo to header (centered) - keep original color for header
      pdf.addImage(logo, "PNG", logoX, headerY, logoWidth, logoHeight);
      
      // Add panel details on the right side
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      
      const infoStartX = logoX + logoWidth + 50; // Start info 20mm after logo ends
      const lineHeight = 5;
      let currentY = headerY + 2; // Align with logo top
      
      // Panel details
      const details = [
        `Module Size: ${size}`,
        `Variant: ${variant}`,
        `Generated: ${new Date().toLocaleDateString()}`
      ];
      
      details.forEach(detail => {
        pdf.text(detail, infoStartX, currentY);
        currentY += lineHeight;
      });

      // Add icon summary in header if there are icons
      const activeIcons = icons.filter(icon => icon !== null) as PanelIcon[];
      if (activeIcons.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        currentY += 2; // Add small gap
      }

      // Generate filename
      const filename = `Livento-panel-${size}module-${Date.now()}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Emergency restore - make sure UI elements are visible again
    const elementsToRestore = [
      document.querySelector('.fixed.right-6'),
      document.querySelector('.flex.flex-wrap.gap-2'),
      document.querySelector('.fixed.top-3')
    ];
    
    elementsToRestore.forEach(element => {
      if (element && element instanceof HTMLElement) {
        element.style.visibility = '';
        element.style.display = '';
      }
    });
    
    throw new Error('Failed to generate PDF. Please try again.');
  }
};