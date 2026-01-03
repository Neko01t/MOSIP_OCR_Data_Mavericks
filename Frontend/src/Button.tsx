import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: ReactNode;
  variant?: 'primary' | 'success' | 'outline'; // Added outline support
}

export default function Button({
  children, isLoading, icon, variant = 'primary', className = '', disabled, ...props
}: ButtonProps) {

  const baseStyles = "w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} /> : icon}
      {isLoading ? 'Processing...' : children}
    </button>
  );
}
