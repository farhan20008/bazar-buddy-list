
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, RotateCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getText } from "@/utils/translations";
import { toast } from "@/components/ui/use-toast";

interface PDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string | null;
  listName: string;
}

export function PDFPreview({ open, onOpenChange, listId, listName }: PDFPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [printUrl, setPrintUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    if (open && listId) {
      // Reset states when dialog opens
      setLoading(true);
      setHasError(false);
      
      // Generate the print URL with timestamp to prevent caching
      const url = `/print-preview/${listId}?t=${Date.now()}`;
      setPrintUrl(url);
    }
  }, [open, listId, retryCount]); // Include retryCount in dependencies to trigger reload

  const handlePrint = () => {
    try {
      // Using the more reliable window.open approach for better font rendering
      const printWindow = window.open(printUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          try {
            setTimeout(() => {
              printWindow.print();
              toast({
                title: getText("printInitiated", language) || "Print Initiated",
                description: getText("printInProgress", language) || "Print dialog will open shortly"
              });
            }, 1000); // Give a little time for fonts to load
          } catch (err) {
            console.error("Error during printing:", err);
            toast({
              title: getText("printError", language) || "Print Error",
              description: getText("printErrorDesc", language) || "Could not open print dialog",
              variant: "destructive"
            });
          }
        });
      } else {
        // Fallback to iframe printing if window.open fails (due to popup blockers)
        const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.print();
          toast({
            title: getText("printInitiated", language) || "Print Initiated",
            description: getText("printInProgress", language) || "Your print dialog should open shortly"
          });
        } else {
          throw new Error("Could not access iframe for printing");
        }
      }
    } catch (error) {
      console.error("Print error:", error);
      setHasError(true);
      toast({
        title: getText("printError", language) || "Print Error",
        description: getText("printErrorDesc", language) || "Could not open print dialog",
        variant: "destructive"
      });
    }
  };

  const handleIframeLoad = () => {
    // Short delay to ensure content is fully loaded
    setTimeout(() => {
      setLoading(false);
      
      // Check if the iframe loaded correctly
      try {
        const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
        if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
          // Check if there's content in the body
          const bodyContent = iframe.contentDocument.body.innerHTML;
          if (bodyContent.length < 50 || bodyContent.includes("Error") || bodyContent.includes("404")) {
            setHasError(true);
            console.error("Preview content appears to be empty or has an error");
          } else {
            setHasError(false);
          }
        }
      } catch (e) {
        console.error("Error checking iframe:", e);
        setHasError(true);
      }
    }, 1000); // Give it a bit more time to render properly
  };

  const handleRetry = () => {
    setLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1); // Increment retry count to trigger useEffect
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{getText("printPreview", language) || "Print Preview"}: {listName}</DialogTitle>
          <DialogDescription>
            {getText("previewBeforePrinting", language) || "Preview your grocery list before printing"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[600px] mt-4 rounded border overflow-hidden relative bg-white">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <iframe
            id="preview-iframe"
            onLoad={handleIframeLoad}
            className="w-full h-full min-h-[600px] border-none bg-white"
            src={printUrl}
            title={`Preview of ${listName}`}
          />
          
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-4">
              <p className="text-destructive mb-4 text-center">
                {getText("previewLoadError", language) || "There was an issue loading the preview"}
              </p>
              <Button 
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                {getText("tryAgain", language) || "Try Again"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {getText("close", language) || "Close"}
          </Button>
          <Button 
            onClick={handlePrint} 
            disabled={loading || hasError}
            className="bg-orange-600 hover:bg-orange-500 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            {getText("print", language) || "Print"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
