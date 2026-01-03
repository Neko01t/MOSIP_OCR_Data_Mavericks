import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExtractionPanel from './components/ExtractionPanel';
import VerificationPanel from './components/VerificationPanel';
import { Toaster } from "./components/ui/sonner"
export interface ExtractedFields {
  [key: string]: string;
}

interface ExtractionState {
  file: File | null;
  preview: string | null;
  result: any | null;
  loading: boolean;
}

interface VerificationState {
  file: File | null;
  preview: string | null;
  inputs: ExtractedFields;
  results: any | null;
  loading: boolean;
}

export default function App() {

  const [activeTab, setActiveTab] = useState<'extract' | 'verify'>('extract');
  const [darkMode, setDarkMode] = useState(false);

  const [extractState, setExtractState] = useState<ExtractionState>({
    file: null, preview: null, result: null, loading: false,
  });

  const [verifyState, setVerifyState] = useState<VerificationState>({
    file: null, preview: null, inputs: {}, results: null, loading: false
  });

  const handleSharedFileSelect = (file: File | null) => {
    if (!file) {
      setSharedFile(null);
      setSharedPreview(null);
      setSharedFileType(null);
      return;
    }

    setSharedFile(file);
    setSharedPreview(URL.createObjectURL(file));

    if (file.type === 'application/pdf') {
      setSharedFileType('pdf');
    } else if (file.type.startsWith('image/')) {
      setSharedFileType('image');
    }
  };
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const updateExtractState = (updates: Partial<ExtractionState>) => {
    setExtractState(prev => ({ ...prev, ...updates }));

    if (updates.result?.fields) {
      setVerifyState(prev => ({ ...prev, inputs: updates.result.fields }));
    }

    if (updates.file !== undefined) {
      setVerifyState(prev => ({
        ...prev,
        file: updates.file || null,
        preview: updates.preview || null
      }));
    }
  };

  const updateVerifyState = (updates: Partial<VerificationState>) => {
    setVerifyState(prev => ({ ...prev, ...updates }));

    if (updates.file !== undefined) {
      setExtractState(prev => ({
        ...prev,
        file: updates.file || null,
        preview: updates.preview || null
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-200">
      <Toaster closeButton={true} position="top-center" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
        isDark={darkMode}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'extract' ? (
            <ExtractionPanel
              state={extractState}
              updateState={updateExtractState}
            />
          ) : (
            <VerificationPanel
              state={verifyState}
              updateState={updateVerifyState} // Use the new sync function
            />
          )}
        </div>
      </main>
    </div>
  );
}
