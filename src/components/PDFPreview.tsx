
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

  useEffect(() => {
    if (open && listId) {
      // Generate the print URL
      const url = `/print-preview/${listId}`;
      setPrintUrl(url);
    }
  }, [open, listId]);

  const handlePrint = () => {
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      // Fallback if iframe printing doesn't work
      const printWindow = window.open(printUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
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
            onLoad={() => setLoading(false)}
            className="w-full h-full min-h-[600px] border-none"
            src={printUrl}
            title={`Preview of ${listName}`}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
