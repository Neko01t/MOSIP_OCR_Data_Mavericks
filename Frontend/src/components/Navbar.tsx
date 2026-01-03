import { Scan, FileText, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle'; // Adjust path if needed

interface NavbarProps {
  activeTab: 'extract' | 'verify';
  setActiveTab: (tab: 'extract' | 'verify') => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export default function Navbar({ activeTab, setActiveTab, toggleTheme, isDark }: NavbarProps) {
  const tabs = [
    { id: 'extract', label: 'Extraction', icon: FileText },
    { id: 'verify', label: 'Verification', icon: ShieldCheck },
  ] as const;

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 transition-colors z-50">

      {/* Logo Section */}
      <div className="flex items-center gap-2 text-primary">
        <Scan size={24} strokeWidth={2.5} />
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          MOSIP <span className="text-primary">INTEL</span>
        </h1>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Theme Toggle Component */}
      <ThemeToggle toggleTheme={toggleTheme} isDark={isDark} />
    </nav>
  );
}
