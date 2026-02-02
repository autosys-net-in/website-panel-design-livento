import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import URLS from "../../config.js"
interface HeaderProps {
  onDownloadPDF?: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ onDownloadPDF }) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!onDownloadPDF) {
      toast({
        title: "Download Unavailable",
        description: "PDF download functionality is not available.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your panel configuration.",
      });

      await onDownloadPDF();
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your panel configuration has been downloaded.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div>
              <h1 className="text-xl font-bold"> <img
                                src="src/assest/logo.png"
                                alt="Livento Logo"
                                className="w-22 h-8 sm:w-30 sm:h-25 md:w-30 md:h-30 object-contain opacity-100 invert "
                             
                              /></h1>
              {/* <p className="text-sm text-muted-foreground">Touch Panel Builder</p> */}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;