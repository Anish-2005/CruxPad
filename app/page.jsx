'use client';

import { useState, useRef, useEffect } from 'react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { processWithAI, extractTextFromPDF, exportTextFile, exportPDF } from './utils/aiUtils';

export default function Page() {
  const [inputText, setInputText] = useState('');
  const [summaryChunks, setSummaryChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        setDarkMode(savedMode === 'true');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
      }
    }
  }, []);

  // Apply dark mode to <body> and store in localStorage
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Handle file upload
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      let text = '';

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        alert('Unsupported file type. Please upload PDF or text files.');
        return;
      }

      setInputText(text);
      const chunks = await processWithAI(text);
      setSummaryChunks(chunks);

    } catch (err) {
      console.error('File processing error:', err);
      alert(`Error processing file: ${err.message}`);
      setSummaryChunks(['Error processing content. Please try with different text.']);
    } finally {
      setLoading(false);
    }
  }

  // Handle manual input
  async function handleInputChange(e) {
    const text = e.target.value;
    setInputText(text);

    if (text.length > 50) { // Lowered threshold for processing
      const chunks = await processWithAI(text);
      setSummaryChunks(chunks);
    } else {
      setSummaryChunks([]);
    }
  }

  // Export handlers
  const handleExportText = () => exportTextFile(summaryChunks);
  const handleExportPDF = () => exportPDF(summaryChunks, darkMode);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${darkMode
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>

      <LoadingOverlay loading={loading} darkMode={darkMode} />
      <AnimatedBackground darkMode={darkMode} />

      {/* Glass morphism container */}
      <div className="relative z-10 min-h-screen">
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

        <div className="px-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          <InputSection
            darkMode={darkMode}
            inputText={inputText}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />

          <OutputSection
            darkMode={darkMode}
            summaryChunks={summaryChunks}
            onExportText={handleExportText}
            onExportPDF={handleExportPDF}
          />
        </div>
      </div>
    </div>
  );
}