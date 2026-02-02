import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PanelConfiguration {
  size: string;
  variant: string;
  glass: string;
  frame: string;
  icons: Array<{
    id: string;
    name: string;
    src: string;
  }>;
}

export const generatePanelPDF = async (configuration: PanelConfiguration): Promise<void> => {
  try {
    // Get the panel element by ID
    const panelElement = document.getElementById('panel-for-export');
    if (!panelElement) {
      throw new Error('Panel element not found. Make sure your panel has id="panel-for-export"');
    }

    // Configure html2canvas for high quality capture
    const canvas = await html2canvas(panelElement, {
      scale: 2, // Higher resolution for crisp images
      useCORS: true,
      backgroundColor: '#f8fafc', // Light background
      logging: false,
      width: panelElement.offsetWidth,
      height: panelElement.offsetHeight,
      removeContainer: true,
    });

    // Create PDF in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Calculate image dimensions to fit properly on page
    const pageWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const margin = 15;
    const maxImageWidth = pageWidth - (margin * 2);
    const maxImageHeight = pageHeight - 80; // Leave space for header and footer

    const imgWidth = Math.min(maxImageWidth, maxImageWidth);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If image is too tall, scale it down
    const finalImageHeight = Math.min(imgHeight, maxImageHeight);
    const finalImageWidth = (canvas.width * finalImageHeight) / canvas.height;

    // Add header with title
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Livento Touch Panel Configuration', margin, 20);

    // Add a line under the title
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, 25, pageWidth - margin, 25);

    // Add configuration details
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    let yPosition = 35;
    
    pdf.text(`Module Size: ${configuration.size} Module`, margin, yPosition);
    pdf.text(`Variant: ${configuration.variant}`, margin, yPosition + 6);
    pdf.text(`Glass Type: ${configuration.glass} Glass`, margin + 80, yPosition);
    pdf.text(`Frame Color: ${configuration.frame} Frame`, margin + 80, yPosition + 6);
    pdf.text(`Icons Configured: ${configuration.icons.length}`, margin + 160, yPosition);
    
    // Add generation timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    pdf.text(`Generated: ${timestamp}`, margin + 160, yPosition + 6);

    // Center the panel image
    const imageX = (pageWidth - finalImageWidth) / 2;
    const imageY = yPosition + 15;

    // Add the panel image
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      imageX,
      imageY,
      finalImageWidth,
      finalImageHeight,
      undefined,
      'FAST'
    );

    // Add footer
    const footerY = pageHeight - 15;
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Livento Panel Designer - Professional Touch Panel Solutions', margin, footerY);
    pdf.text('Visit: www.Livento.co.in | Email: info@Livento.co.in', margin, footerY + 5);

    // Add page border
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Generate filename with configuration and timestamp
    const sanitizedVariant = configuration.variant.replace(/\s+/g, '');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Livento_${configuration.size}Module_${sanitizedVariant}_${dateStr}.pdf`;

    // Download the PDF
    pdf.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const downloadPanelImage = async (): Promise<void> => {
  try {
    const panelElement = document.getElementById('panel-for-export');
    if (!panelElement) {
      throw new Error('Panel element not found');
    }

    const canvas = await html2canvas(panelElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `Livento-panel-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Image download error:', error);
    throw new Error('Failed to download image. Please try again.');
  }
};