import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Using shadcn button
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface RawDataViewerProps {
  data: any;
  rawText: string;
}

export default function RawDataViewer({ data, rawText }: RawDataViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-dashed w-full max-w-full">
      <CardHeader className="py-3 bg-muted/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          RAW DATA OUTPUT
          <Badge variant="outline" className="text-[10px] font-normal">JSON + TEXT</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-64 w-full rounded-b-md">
          <div className="p-4 space-y-6">

            {/* Raw Text Section */}
            <div className="w-full">
              <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase">OCR Text Stream</h4>
              {/* whitespace-pre-wrap + break-words prevents overflow */}
              <pre className="text-xs font-mono bg-secondary/50 p-3 rounded-lg whitespace-pre-wrap break-words text-foreground/80 border border-border">
                {rawText || "No raw text captured."}
              </pre>
            </div>

            {/* JSON Section */}
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Full JSON Response</h4>

                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={handleCopy}
                  title="Copy JSON"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* JSON Container */}
              <div className="relative rounded-lg bg-slate-950 border border-border/50 overflow-hidden">
                <pre className="text-xs font-mono text-emerald-400 p-3 overflow-x-auto whitespace-pre-wrap break-words max-w-full">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
