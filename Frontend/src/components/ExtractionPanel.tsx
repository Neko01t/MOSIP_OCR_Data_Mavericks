import { useState, useEffect } from 'react';
import DropZone from './DropZone';
import { toast } from "sonner";
import { ArrowRight, ScanText, ChevronDown, ChevronUp, Code, LayoutTemplate } from 'lucide-react';
import ImageQualityDisplay from './ImageQualityDisplay';
import OcrConfidenceDisplay from './OcrConfidenceDisplay';

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import RawDataViewer from './ui/RawDataViewer';

const API_URL = 'http://localhost:3000';

interface ExtractionPanelProps {
  state: {
    file: File | null;
    preview: string | null;
    result: any;
    loading: boolean;
  };
  updateState: (updates: any) => void;
}

export default function ExtractionPanel({ state, updateState }: ExtractionPanelProps) {
  const [showRawData, setShowRawData] = useState(false);

  // 1. Restore Layout State
  const [layouts, setLayouts] = useState<{id: string, name: string}[]>([]);
  const [selectedLayout, setSelectedLayout] = useState('auto');

  // 2. Restore Layout Fetching
  useEffect(() => {
    fetch(`${API_URL}/layouts`)
      .then(res => res.json())
      .then(data => {
        setLayouts(data);
        if(data.length > 0) setSelectedLayout("auto");
      })
      .catch(() => {
        const fallback = [{ id: 'generic', name: 'Generic Document' }];
        setLayouts(fallback);
        setSelectedLayout('generic');
      });
  }, []);

  const getFileType = () => {
    if (!state.file) return null;
    if (state.file.type === 'application/pdf') return 'pdf';
    return 'image';
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      updateState({ file, preview: URL.createObjectURL(file), result: null });
      setShowRawData(false);
    } else {
      updateState({ file: null, preview: null, result: null });
    }
  };

  const processExtraction = async () => {
    if (!state.file) {
        toast.error("MISSING INPUT", {
            description: <span className="text-muted-foreground">A valid document file is required to proceed.</span>,
            duration: 4000,
        });
        return;
    }

    updateState({ loading: true });
    setShowRawData(false);
    const formData = new FormData();
    formData.append('document', state.file);

    // 3. Append Layout Param logic
    const layoutParam = selectedLayout && selectedLayout !== 'auto' ? `?layout=${selectedLayout}` : '';

    try {
      // Add layoutParam to URL
      const res = await fetch(`${API_URL}/extract${layoutParam}`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        updateState({ result: data });
        toast.success("DOCUMENT ANALYZED", {
            description: <span className="text-muted-foreground">Layout detected: {data.layout_used}</span>,
        });
      } else {
        toast.error("PROCESSING FAILED", {
            description: <span className="text-muted-foreground">{data.error || "System could not parse the document."}</span>,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("SYSTEM ERROR", {
          description: <span className="text-muted-foreground">Connection to server timed out.</span>,
      });
    } finally {
      updateState({ loading: false });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* LEFT: Upload & Layout Selection */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DropZone
                onFileSelect={handleFileSelect}
                label="Upload Document for Analysis"
                preview={state.preview}
                fileType={getFileType()}
            />

            {/* 4. Restore Dropdown UI */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold">
                <LayoutTemplate size={14} /> Document Layout
              </Label>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Detect</SelectItem>
                  {layouts.filter(l => l.id !== 'auto').map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={processExtraction}
              disabled={!state.file || state.loading}
              className="w-full"
              size="lg"
            >
              {state.loading ? "Processing..." : "Extract Data"}
              {!state.loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Results */}
      <Card className="flex flex-col h-full overflow-hidden border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/20 border-b border-border/50">
          <CardTitle>Extracted Attributes</CardTitle>

          {state.result?.layout_used && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background text-muted-foreground border border-border shadow-sm">
              <ScanText size={12} className="opacity-70" />
              <span className="text-[10px] font-medium tracking-wide uppercase max-w-[150px] truncate" title={state.result.layout_used}>
                {state.result.layout_used}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {state.result ? (
            <div className="space-y-6">

              {/* 1. Image Quality Card */}
              {state.result.quality_scores?.image_quality && (
                <ImageQualityDisplay quality={state.result.quality_scores.image_quality} />
              )}

              {/* 2. New OCR Confidence Card */}
              <OcrConfidenceDisplay
                confidence={state.result.quality_scores?.ocr_confidence}
                reason={state.result.quality_scores?.confidence_reason}
                model={state.result.quality_scores?.model_used}
              />

              {/* 3. Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(state.result.fields || {}).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{key.replace(/_/g, ' ')}</Label>
                    <Input
                      readOnly
                      value={String(value)}
                      className="bg-secondary/50 font-medium text-foreground border-border/60 focus-visible:ring-0"
                    />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* --- COLLAPSIBLE RAW DATA SECTION --- */}
              <div className="rounded-md border border-border overflow-hidden">
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Code size={16} />
                    <span>Raw JSON Data</span>
                  </div>
                  {showRawData ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRawData && (
                  <div className="p-0 bg-card animation-in slide-in-from-top-2 duration-200">
                    <RawDataViewer
                      data={state.result}
                      rawText={state.result.raw_text}
                    />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4 min-h-[300px]">
              <div className="p-4 bg-secondary rounded-full">
                <ArrowRight size={32} />
              </div>
              <p>Upload a document to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
