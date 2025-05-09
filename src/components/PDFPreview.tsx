
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string | null;
  listName: string;
}

export function PDFPreview({ open, onOpenChange, listId, listName }: PDFPreviewProps) {
  const [loading, setLoading] = React.useState(true);

  // This component provides a fallback mechanism when direct PDF download fails
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>PDF Preview: {listName}</DialogTitle>
          <DialogDescription>
            You can print this preview using your browser's print function
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[500px] mt-4 rounded border overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* Simple HTML representation of the list that can be printed */}
          <div className="print-container p-6">
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .print-container, .print-container * {
                    visibility: visible;
                  }
                  .print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
              `}
            </style>
            <iframe
              onLoad={() => setLoading(false)}
              className="w-full h-full min-h-[500px] border-none"
              src={`/print-preview/${listId}`}
              title={`Preview of ${listName}`}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
