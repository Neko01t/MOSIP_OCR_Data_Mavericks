import { useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
  preview?: string | null;
  // NEW: Accept fileType from parent
  fileType?: 'pdf' | 'image' | null;
}

export default function DropZone({ onFileSelect, label, preview, fileType }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // REMOVED: const [fileType, setFileType] = useState(...) -> No longer needed

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    // REMOVED: Internal setFileType logic
    onFileSelect(file);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ... Drag handlers remain the same ...
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-80 border-2 border-dashed rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer transition-all
        ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : preview
              ? 'border-primary/50 bg-secondary/30'
              : 'border-border hover:border-primary/50 hover:bg-secondary/30'
        }
      `}
    >
      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*,.pdf"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <>
          {/* Use the Prop here */}
          {fileType === 'pdf' ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileText size={40} />
              <p className="text-sm font-semibold">PDF Document</p>
            </div>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain p-4"
            />
          )}

          <button
            onClick={reset}
            className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 shadow-md transition-opacity"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <div className="text-center p-6 pointer-events-none">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-primary/20' : 'bg-secondary'}`}>
            <UploadCloud
              className={`transition-colors ${isDragging ? 'text-primary' : 'text-primary'}`}
              size={32}
            />
          </div>
          <h3 className="font-semibold text-card-foreground">
            {isDragging ? 'Drop file here' : (label || 'Upload Document')}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {isDragging ? 'Release to upload' : 'Drag & Drop or Click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
             JPG, PNG or PDF up to 10MB
          </p>
          <p className="text-sm text-muted-foreground pt-2" >
            Supported layouts only. Unknown layouts may require manual review.
          </p>
        </div>
      )}
    </div>
  );
}
