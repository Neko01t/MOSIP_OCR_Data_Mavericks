interface StatsCardProps {
  value: string | number;
  label: string;
  type?: 'success' | 'info'; // Replaced 'color' prop
}

export default function StatsCard({ value, label, type = 'info' }: StatsCardProps) {
  // We use opacity utilities to make the colors adapt to the theme background
  const styles = {
    success: "bg-success/10 border-success/20 text-success",
    info: "bg-primary/10 border-primary/20 text-primary"
  };

  return (
    <div className={`${styles[type]} border p-4 rounded-xl text-center transition-colors`}>
      <div className="text-2xl font-bold">
        {value}
      </div>
      <div className="text-xs font-bold opacity-80 uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}
