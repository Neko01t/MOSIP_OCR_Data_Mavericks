import { useState } from 'react';
import DropZone from './DropZone';
import { toast } from 'sonner' ;
import { ShieldCheck, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ExtractedFields } from '../App';
import ImageQualityDisplay from './ImageQualityDisplay';

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = 'http://localhost:3000';

interface VerificationPanelProps {
  state: {
    file: File | null;
    preview: string | null;
    inputs: ExtractedFields;
    results: any;
    quality?: any;
    loading: boolean;
  };
  updateState: (updates: any) => void;
}

export default function VerificationPanel({ state, updateState }: VerificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const getFileType = () => {
    if (!state.file) return null;
    if (state.file.type === 'application/pdf') return 'pdf';
    return 'image';
  };
  const handleInputChange = (key: string, value: string) => {
    updateState({
      inputs: { ...state.inputs, [key]: value }
    });
  };

  const processVerification = async () => {
    if (!state.file) return toast.error("Please upload a proof document");

    setLoading(true);
    const formData = new FormData();
    formData.append('document', state.file);

    Object.entries(state.inputs).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    try {
      const res = await fetch(`${API_URL}/verify`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        updateState({ results: data.verification });
        toast.success("Verification complete");
      } else {
        toast.error("Verification failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      updateState({
        file,
        preview: URL.createObjectURL(file),
        results: null
      });
    } else {
      updateState({ file: null, preview: null, results: null });
    }
  };

  const renderStatusBadge = (status: string, confidence: number) => {
    const percentage = Math.round(confidence * 100);

    switch (status) {
      case 'MATCH':
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-emerald-600">
            <CheckCircle2 size={12} className="mr-1" /> MATCH
          </Badge>
        );
      case 'PARTIAL_MATCH':
        return (
          <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white border-amber-600">
            <AlertTriangle size={12} className="mr-1" />
             Partial Match
          </Badge>
        );
      case 'MISMATCH':
      default:
        return (
          <Badge variant="destructive">
            <XCircle size={12} className="mr-1" /> MISMATCH
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Upload Column */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Proof Document</CardTitle>
          </CardHeader>
          <CardContent>
            <DropZone
              onFileSelect={handleFileSelect}
              label="Upload Document for Verification"
              preview={state.preview}
              fileType={getFileType()}
            />

          </CardContent>
        </Card>

        {state.quality && <ImageQualityDisplay quality={state.quality} />}
      </div>

      {/* Inputs & Results Column */}
      <div className="flex flex-col gap-6 h-full">
        <Card>
          <CardHeader>
             <CardTitle>Claimed Identity Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(state.inputs).length > 0 ? (
                Object.keys(state.inputs).map((key) => (
                  <div key={key} className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Claimed {key.replace(/_/g, ' ')}</Label>
                      <Input
                        value={state.inputs[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="bg-secondary/50"
                      />
                  </div>
                ))
              ) : (
                ['Name', 'ID Number', 'DOB'].map(k => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Claimed {k}</Label>
                    <Input placeholder={`Enter ${k}`} disabled className="bg-secondary/50" />
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={processVerification}
              disabled={loading || !state.file}
              className="w-full"
              size="lg"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              {loading ? 'Verifying...' : 'Run Verification'}
            </Button>
            <p className="text-xs font-italic text-muted-foreground" >Case-insensitive normalization applied</p>
          </CardContent>
        </Card>

        {state.results && (
          <Card className="flex-1 overflow-y-auto custom-scrollbar border-primary/20">
              <CardHeader className="bg-secondary/30 pb-3">
                <CardTitle className="text-base">Attribute Verification Report</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {Object.entries(state.results).map(([key, info]: [string, any]) => (
                  <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${info.status == 'PARTIAL_MATCH' ? 'border-amber-600' : info.status == 'MISMATCH'  ? 'border-[#E7000B]' : 'border-border'} bg-card shadow-sm`}>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium mt-1">{info.submitted_value}</span>
                        {info.status !== 'MATCH' && info.normalized_value && (
                           <span className="text-[10px] text-muted-foreground mt-1">
                             (Extracted : "{info.normalized_value.substring(0, 20)}...")
                           </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {renderStatusBadge(info.status, info.match_confidence)}

                      <span className={`text-[10px] ${
                        info.match_confidence > 0.8 ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        {info.status !== 'MATCH' && (
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(info.match_confidence * 100)}% Similarity
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
