'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
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
    <>
      <Head>
        <title>CruxPad - AI-Powered Cheatsheet Generator | Create Study Notes Instantly</title>
        <meta name="description" content="Transform lengthy documents into concise, beautiful cheatsheets using advanced AI. Upload PDFs or paste text to create professional study materials instantly. Free AI-powered learning tool." />
        <meta name="keywords" content="cheatsheet generator, AI study notes, PDF to cheatsheet, learning tool, educational AI, study materials, knowledge condensation" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cruxpad.vercel.app/" />
        <meta property="og:title" content="CruxPad - AI-Powered Cheatsheet Generator" />
        <meta property="og:description" content="Transform lengthy documents into concise, beautiful cheatsheets using advanced AI. Create professional study materials instantly." />
        <meta property="og:image" content="https://cruxpad.vercel.app/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://cruxpad.vercel.app/" />
        <meta property="twitter:title" content="CruxPad - AI-Powered Cheatsheet Generator" />
        <meta property="twitter:description" content="Transform lengthy documents into concise, beautiful cheatsheets using advanced AI." />
        <meta property="twitter:image" content="https://cruxpad.vercel.app/og-image.png" />

        {/* Additional SEO meta tags */}
        <meta name="author" content="CruxPad Team" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href="https://cruxpad.vercel.app/" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "CruxPad",
              "description": "AI-powered application that transforms lengthy documents into concise, beautiful cheatsheets for efficient learning and study.",
              "url": "https://cruxpad.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "PDF text extraction and processing",
                "AI-powered content summarization",
                "Beautiful PDF export with professional design",
                "Dark and light theme support",
                "Real-time text processing",
                "Multiple export formats"
              ],
              "screenshot": "https://cruxpad.vercel.app/screenshot.png",
              "author": {
                "@type": "Organization",
                "name": "CruxPad"
              }
            })
          }}
        />
      </Head>

      <main className={`min-h-screen relative overflow-hidden transition-all duration-700 ${darkMode ? 'dark dark-scrollbars' : 'light-scrollbars'} ${darkMode
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`} role="main" aria-label="CruxPad AI Cheatsheet Generator">

        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>

        <LoadingOverlay loading={loading} darkMode={darkMode} />
        <AnimatedBackground darkMode={darkMode} />

        {/* Glass morphism container */}
        <div className="relative z-10 min-h-screen">
          <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

          <div className="px-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto" id="main-content">
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
      </main>
    </>
  );
}