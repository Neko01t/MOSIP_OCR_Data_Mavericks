import { CheckCircle2, AlertTriangle, XCircle, ScanLine, AlertCircle } from 'lucide-react';

const ImageQualityDisplay = ({ quality }) => {
  if (!quality) return null;

  const { score, rating, issues } = quality;

const getStatusConfig = () => {
    if (rating === 'Good' || rating === 'PDF') return {
      iconColor: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      icon: <CheckCircle2 size={20} />,
      label: rating === 'PDF' ? 'Digital PDF (No image degradation)' : 'Excellent Quality'
    };

    if (rating === 'Medium') return {
       iconColor: 'text-amber-500',
       barColor: 'bg-amber-500',
       icon: <AlertCircle size={20} />,
       label: 'Acceptable Quality'
    };

    if (rating === 'Poor') return {
      iconColor: 'text-orange-500',
      barColor: 'bg-orange-500',
      icon: <AlertTriangle size={20} />,
      label: 'Below Optimal Quality'
    };

    return {
      iconColor: 'text-destructive',
      barColor: 'bg-destructive',
      icon: <XCircle size={20} />,
      label: 'Unusable'
    };
  };  const status = getStatusConfig();

  return (
    <div
      className="bg-card text-card-foreground border border-border p-5 mb-6 shadow-sm"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md bg-secondary ${status.iconColor}`}>
            <ScanLine size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Image Analysis
            </h3>
            <div className={`text-lg font-bold flex items-center gap-2 ${status.iconColor}`}>
              {status.icon}
              {rating} ({score}/100)
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full bg-secondary h-2 mb-4 overflow-hidden"
        style={{ borderRadius: 'calc(var(--radius) / 2)' }}
      >
        <div
          className={`h-full transition-all duration-500 ease-out ${status.barColor}`}
          style={{ width: `${score}%`, borderRadius: 'calc(var(--radius) / 2)' }}
        ></div>
      </div>

      {issues && issues.length > 0 ? (
        <div
          className="bg-muted/50 border border-border p-3"
          style={{ borderRadius: 'calc(var(--radius) / 2)' }}
        >
          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <AlertCircle size={12} /> ISSUES DETECTED
          </p>
          <ul className="space-y-1.5">
            {issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic flex items-center gap-2">
           <CheckCircle2 size={14} className="text-primary" /> No issues detected. Scan is clear.
        </div>
      )}
    </div>
  );
};

export default ImageQualityDisplay;
