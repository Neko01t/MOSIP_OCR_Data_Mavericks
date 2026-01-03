import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className = '', readOnly, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
        {label}
      </label>
      <input
        readOnly={readOnly}
        className={`w-full bg-secondary border border-[#404797] text-foreground text-sm rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors
        ${readOnly ? 'cursor-default opacity-80' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}
