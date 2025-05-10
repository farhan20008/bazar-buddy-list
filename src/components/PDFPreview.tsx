
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";

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

  useEffect(() => {
    if (open && listId) {
      // Reset states when dialog opens
      setLoading(true);
      setHasError(false);
      
      // Generate the print URL
      const url = `/print-preview/${listId}`;
      setPrintUrl(url);
    }
  }, [open, listId]);

  const handlePrint = () => {
    try {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
      } else {
        // Fallback if iframe printing doesn't work
        const printWindow = window.open(printUrl, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            try {
              printWindow.print();
            } catch (err) {
              console.error("Error during printing:", err);
            }
          });
        } else {
          throw new Error("Could not open print window");
        }
      }
    } catch (error) {
      console.error("Print error:", error);
      setHasError(true);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    // Check if the iframe loaded correctly
    try {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        // Check if there's content in the body
        if (iframe.contentDocument.body.innerHTML.length < 50) {
          setHasError(true);
        } else {
          setHasError(false);
        }
      }
    } catch (e) {
      console.error("Error checking iframe:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Print Preview: {listName}</DialogTitle>
          <DialogDescription>
            Preview your grocery list before printing
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[600px] mt-4 rounded border overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <iframe
            id="preview-iframe"
            onLoad={handleIframeLoad}
            className="w-full h-full min-h-[600px] border-none"
            src={printUrl}
            title={`Preview of ${listName}`}
          />
          
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-4">
              <p className="text-destructive mb-2">There was an issue loading the preview</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setLoading(true);
                  setHasError(false);
                  // Add a timestamp to force reload
                  setPrintUrl(`/print-preview/${listId}?t=${Date.now()}`);
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} disabled={loading || hasError}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
