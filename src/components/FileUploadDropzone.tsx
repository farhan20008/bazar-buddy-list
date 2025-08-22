import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Image, Upload, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FileUploadDropzoneProps {
  onFilesProcessed: (extractedText: string) => void;
}

export function FileUploadDropzone({ onFilesProcessed }: FileUploadDropzoneProps) {
  const { isEnglish } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    try {
      // Simulate file processing - in real implementation, you would:
      // 1. Upload files to storage
      // 2. Use OCR service for images
      // 3. Extract text from PDFs
      // 4. Parse grocery items from extracted text
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      // Mock extracted text
      const mockExtractedText = `
        Rice - 2 kg
        Potatoes - 1 kg
        Onions - 500g
        Chicken - 1 kg
        Milk - 1 liter
        Eggs - 12 pieces
      `;
      
      onFilesProcessed(mockExtractedText);
      setUploadedFiles([]);
      
      toast({
        title: isEnglish ? "Files Processed" : "ফাইল প্রক্রিয়া সম্পন্ন",
        description: isEnglish 
          ? "Items extracted from your files have been added to the form" 
          : "আপনার ফাইল থেকে আইটেম নিষ্কাশন করে ফর্মে যোগ করা হয়েছে"
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: isEnglish ? "Processing Error" : "প্রক্রিয়াকরণ ত্রুটি",
        description: isEnglish 
          ? "Failed to process uploaded files" 
          : "আপলোড করা ফাইল প্রক্রিয়া করতে ব্যর্থ",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive 
                ? (isEnglish ? "Drop files here..." : "এখানে ফাইল ছাড়ুন...")
                : (isEnglish ? "Upload Shopping List" : "কেনাকাটার তালিকা আপলোড করুন")
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {isEnglish 
                ? "Drag & drop images or PDFs, or click to browse"
                : "ছবি বা PDF টেনে এনে ছাড়ুন, অথবা ব্রাউজ করতে ক্লিক করুন"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isEnglish ? "Max 10MB per file" : "প্রতি ফাইলে সর্বোচ্চ ১০MB"}
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">
                {isEnglish ? "Uploaded Files:" : "আপলোড করা ফাইল:"}
              </h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <Image className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                onClick={processFiles} 
                disabled={isProcessing}
                className="w-full mt-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEnglish ? "Processing..." : "প্রক্রিয়াকরণ..."}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {isEnglish ? "Extract Items" : "আইটেম নিষ্কাশন করুন"}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}