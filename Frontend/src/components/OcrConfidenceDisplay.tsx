import { CheckCircle2, AlertTriangle, XCircle, FileText, Sparkles, BrainCircuit } from 'lucide-react';

interface OcrConfidenceDisplayProps {
  confidence: number;
  reason?: string;
  model?: string;
}

const OcrConfidenceDisplay = ({ confidence, reason, model }: OcrConfidenceDisplayProps) => {
  if (confidence === undefined || confidence === null) return null;

  const score = Math.round(confidence);

  const getStatusConfig = () => {
    // High Confidence
    if (score >= 90) return {
      iconColor: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-200/50',
      icon: <CheckCircle2 size={20} />,
      label: 'High Accuracy'
    };

    // Medium Confidence
    if (score >= 70) return {
       iconColor: 'text-amber-500',
       barColor: 'bg-amber-500',
       bgColor: 'bg-amber-500/10',
       borderColor: 'border-amber-200/50',
       icon: <AlertTriangle size={20} />,
       label: 'Moderate Accuracy'
    };

    // Low Confidence
    return {
      iconColor: 'text-destructive',
      barColor: 'bg-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/40',
      icon: <XCircle size={20} />,
      label: 'Low Accuracy'
    };
  };

  const status = getStatusConfig();

  // Split the reason string into a list for better display, if it exists
  const reasonList = reason ? reason.split('. ').filter(r => r.trim().length > 0) : [];

  return (
    <div
      className="bg-card text-card-foreground border border-border p-5 mb-6 shadow-sm"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${status.bgColor} ${status.iconColor}`}>
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Text Recognition Quality
            </h3>
            <div className={`text-lg font-bold flex items-center gap-2 ${status.iconColor}`}>
              {status.icon}
              {status.label} ({score}%)
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full bg-secondary h-2 mb-4 overflow-hidden"
        style={{ borderRadius: 'calc(var(--radius) / 2)' }}
      >
        <div
          className={`h-full transition-all duration-500 ease-out ${status.barColor}`}
          style={{ width: `${score}%`, borderRadius: 'calc(var(--radius) / 2)' }}
        ></div>
      </div>

      {/* Model Used Badge (Optional) */}
      {model && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Sparkles size={12} />
            <span>Processing Model: <span className="font-medium text-foreground capitalize">{model.replace('_', ' ')}</span></span>
        </div>
      )}

      {/* Reasons Section */}
      {reasonList.length > 0 ? (
        <div
          className="bg-muted/50 border border-border p-3"
          style={{ borderRadius: 'calc(var(--radius) / 2)' }}
        >
          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <FileText size={12} /> CONFIDENCE FACTORS
          </p>
          <ul className="space-y-1.5">
            {reasonList.map((r, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                {r.replace(/\.$/, '')} {/* Remove trailing dots if present */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic flex items-center gap-2">
           <CheckCircle2 size={14} className="text-primary" /> Confidence is optimal.
        </div>
      )}
    </div>
  );
};

export default OcrConfidenceDisplay;
