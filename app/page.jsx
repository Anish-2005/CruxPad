'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Download, Moon, Sun, Upload, Sparkles } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary, darkMode }) {
  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} border ${darkMode ? 'border-red-700' : 'border-red-300'}`}>
      <h3 className="font-bold text-red-600">Something went wrong</h3>
      <pre className="text-sm text-red-500">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className={`mt-2 px-3 py-1 rounded ${darkMode ? 'bg-red-700' : 'bg-red-500'} text-white`}
      >
        Try again
      </button>
    </div>
  );
}

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
  // Process text with AI API
  async function processWithAI(text) {
    try {
      setLoading(true);
      const prompt = `Please analyze the following text and generate a slightly detailed cheatsheet with these guidelines:
- Cover all major concepts, terms, and key points
- For each item, include a short explanation (1-2 sentences)
- Group related concepts under clear headings and subheadings
- Use bullet points or numbered lists for clarity
- Include examples, formulas, or quick tips where applicable
- Keep it compact but informative, suitable for quick revision

Text: ${text.substring(0, 300000)}`;


      const response = await puter.ai.chat(prompt, {
        model: 'gemini-3-pro-preview'
      });

      console.log('Full Puter response:', response); // Debug log

      // More flexible response extraction
      let resultText = '';
      if (typeof response === 'string') {
        resultText = response;
      } else if (response?.text) {
        resultText = response.text;
      } else if (response?.message?.content) {
        resultText = response.message.content;
      } else {
        resultText = JSON.stringify(response);
      }

      // More flexible content extraction
      const chunks = resultText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        // Extract any lines that look like bullet points or key points
        .filter(line => line.match(/^[-•*]|^\d+\.|^[A-Za-z0-9][^.:;!?]*$/))
        .map(chunk => {
          // Clean up the chunks
          return chunk.replace(/^[-•*]\s*/, '')  // Remove bullet chars
            .replace(/^\d+\.\s*/, '')   // Remove numbered bullets
            .replace(/"/g, '')          // Remove quotes
            .trim();
        })
        .filter(chunk => chunk.length > 3); // Keep only meaningful chunks

      console.log('Final chunks:', chunks); // Debug log

      if (chunks.length === 0) {
        // Fallback - if no bullets found, try splitting by sentences
        const sentences = resultText.split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 5);
        return sentences.length > 0 ? sentences : [resultText.substring(0, 200)];
      }

      return chunks;
    } catch (err) {
      console.error('AI processing error:', err);
      alert(`Error processing with AI: ${err.message}`);
      return ['Failed to generate content. Please try again.'];
    } finally {
      setLoading(false);
    }
  }

  // Extract text from PDF
  async function extractTextFromPDF(file) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract PDF text');
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      alert('Error processing PDF. Please try another file.');
      return '';
    } finally {
      setLoading(false);
    }
  }

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

  // Export as text file
  function exportTextFile() {
    try {
      if (summaryChunks.length === 0) {
        alert('No content to export!');
        return;
      }

      const text = summaryChunks.join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'summary.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Failed to export text: ${err.message}`);
    }
  }

function formatAIText(text) {
  // Split into sections based on common heading patterns
  const sections = text.split(/\n\s*\n|\n(?=\*{2}|[A-Z][A-Za-z ]+:|[IVX]+\.)/);
  
  let formattedOutput = [];
  
  sections.forEach(section => {
    // Clean up the section
    section = section.trim();
    if (!section) return;
    
    // Check if this is a heading
    const isHeading = section.match(/^\*{2}.+\*{2}$|^[A-Z][A-Za-z ]+:|^[IVX]+\./);
    
    if (isHeading) {
      // Major heading (like "**Objective**" or "I. Introduction")
      if (section.match(/^\*{2}.+\*{2}$|^[IVX]+\./)) {
        formattedOutput.push({
          type: 'major-heading',
          text: section.replace(/\*{2}/g, '')
        });
      } 
      // Subheading (like "Approach:")
      else {
        formattedOutput.push({
          type: 'subheading', 
          text: section
        });
      }
    } 
    // Regular content
    else {
      // Split into paragraphs if needed
      const paragraphs = section.split(/\n\s*/);
      paragraphs.forEach(para => {
        if (para.trim()) {
          formattedOutput.push({
            type: 'paragraph',
            text: para
          });
        }
      });
    }
  });
  
  return formattedOutput;
}

function exportPDF() {
  if (summaryChunks.length === 0) {
    alert('No content to export!');
    return;
  }

  (async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Optimized layout settings for conciseness
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Enhanced theme matching website colors
      const theme = {
        light: {
          background: '#ffffff',
          gradientStart: '#f0f9ff',
          gradientEnd: '#e0f2fe',
          text: '#0f172a',
          heading: '#4f46e5', // indigo-600
          subheading: '#7c3aed', // purple-600
          accent: '#db2777', // pink-600
          cardBg: '#ffffff',
          cardBorder: '#6366f1', // indigo-500
          cardShadow: '#8b5cf6', // purple-500
          highlight: '#f0f9ff',
          secondary: '#64748b',
          cardGradients: ['#fef3c7', '#ecfdf5', '#f0f9ff', '#fef2f2', '#f3e8ff', '#ecfeff']
        },
        dark: {
          background: '#0f172a',
          gradientStart: '#1e293b',
          gradientEnd: '#334155',
          text: '#f8fafc',
          heading: '#a5b4fc', // indigo-300
          subheading: '#c4b5fd', // purple-300
          accent: '#f472b6', // pink-400
          cardBg: '#1e293b',
          cardBorder: '#6366f1', // indigo-500
          cardShadow: '#8b5cf6', // purple-500
          highlight: '#1e293b',
          secondary: '#94a3b8',
          cardGradients: ['#1f2937', '#374151', '#1e293b', '#374151', '#1f2937', '#374151']
        }
      };

      const currentTheme = darkMode ? theme.dark : theme.light;

      // Helper functions
      function addStunningHeader() {
        const headerHeight = 100;

        // Multi-layer gradient background
        for (let i = 0; i < headerHeight; i += 5) {
          const progress = i / headerHeight;
          const r = Math.floor(14 + (59 * progress));
          const g = Math.floor(165 + (90 * progress));
          const b = Math.floor(233 + (22 * progress));
          doc.setFillColor(r, g, b);
          doc.rect(0, i, pageWidth, 5, 'F');
        }

        // Decorative top border
        doc.setFillColor(currentTheme.accent);
        doc.rect(0, 0, pageWidth, 3, 'F');

        // Logo/Icon with enhanced design
        const logoX = margin;
        const logoY = 35;

        // Outer circle
        doc.setFillColor(currentTheme.cardBg);
        doc.circle(logoX, logoY, 18, 'F');

        // Inner gradient circle
        doc.setFillColor(currentTheme.heading);
        doc.circle(logoX, logoY, 15, 'F');

        // Sparkle effect (multiple small circles)
        doc.setFillColor('#ffffff');
        doc.circle(logoX - 6, logoY - 6, 2, 'F');
        doc.circle(logoX + 6, logoY - 6, 2, 'F');
        doc.circle(logoX, logoY + 8, 2, 'F');

        // Title with enhanced typography
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor('#ffffff');
        doc.text('CruxPad', logoX + 30, 28);

        doc.setFontSize(20);
        doc.setTextColor(currentTheme.secondary);
        doc.text('Professional Cheatsheet', logoX + 30, 48);

        // Subtitle with gradient effect
        doc.setFontSize(12);
        doc.setTextColor('#ffffff');
        doc.text('AI-Powered • Concise • Stunning', logoX + 30, 68);

        // Date and branding
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200); // Light gray instead of rgba
        doc.text(`Generated ${dateStr}`, pageWidth - margin, 85, null, null, 'right');

        return headerHeight;
      }

      function addFooter(pageNum, totalPages) {
        const footerY = pageHeight - 25;

        // Elegant footer line
        doc.setDrawColor(currentTheme.cardBorder);
        doc.setLineWidth(1);
        doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

        // Page indicator with circle
        doc.setFillColor(currentTheme.accent);
        doc.circle(pageWidth / 2, footerY + 2, 8, 'F');

        doc.setFontSize(8);
        doc.setTextColor('#ffffff');
        doc.text(`${pageNum}/${totalPages}`, pageWidth / 2, footerY + 6, null, null, 'center');

        // Branding
        doc.setFontSize(7);
        doc.setTextColor(currentTheme.secondary);
        doc.text('Powered by CruxPad AI', margin, footerY + 5, null, null, 'left');
      }

      function drawStunningCard(x, y, width, height, content, index) {
        const cardTheme = currentTheme.cardGradients[index % currentTheme.cardGradients.length];

        // Card background with gradient
        doc.setFillColor(cardTheme);
        doc.roundedRect(x, y, width, height, 8, 8, 'F');

        // Subtle inner shadow effect
        doc.setDrawColor(currentTheme.cardBorder);
        doc.setLineWidth(0.5);
        doc.roundedRect(x + 1, y + 1, width - 2, height - 2, 7, 7, 'S');

        // Accent top border
        doc.setFillColor(currentTheme.accent);
        doc.roundedRect(x, y, width, 3, 8, 8, 'F');

        // Content area
        const padding = 10;
        const contentX = x + padding;
        const contentY = y + padding + 6;

        // Number badge with enhanced design
        doc.setFillColor(currentTheme.heading);
        doc.circle(contentX + 8, contentY - 2, 10, 'F');

        // Inner highlight
        doc.setFillColor(currentTheme.accent);
        doc.circle(contentX + 8, contentY - 4, 4, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor('#ffffff');
        doc.text((index + 1).toString(), contentX + 8, contentY + 2, null, null, 'center');

        // Content text with better typography
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(currentTheme.text);

        const maxWidth = width - (padding * 2) - 25;
        const lines = doc.splitTextToSize(content, maxWidth);

        // Optimized to 3 lines for conciseness
        const displayLines = lines.slice(0, 3);
        if (lines.length > 3) {
          displayLines[2] = displayLines[2].replace(/[^\s]*$/, '...');
        }

        displayLines.forEach((line, lineIndex) => {
          const lineY = contentY + 8 + (lineIndex * 10);
          doc.text(line, contentX + 22, lineY);
        });

        return height;
      }

      // Initialize first page
      let currentPage = 1;
      let yPos = addStunningHeader() + 20;
      let cardIndex = 0;

      // Optimized card layout for conciseness (3 cards per row)
      const cardsPerRow = 3;
      const cardWidth = (contentWidth - 30) / cardsPerRow; // More space between cards
      const cardHeight = 65; // Reduced height for conciseness
      const cardSpacing = 12;

      // Process chunks in optimized card grid
      for (let i = 0; i < summaryChunks.length; i++) {
        const chunk = summaryChunks[i];

        // Check if we need a new page
        if (yPos + cardHeight > pageHeight - 60) {
          addFooter(currentPage, Math.ceil(summaryChunks.length / (cardsPerRow * 4)));
          doc.addPage();
          currentPage++;
          yPos = addStunningHeader() + 20;
        }

        // Calculate card position
        const rowIndex = cardIndex % cardsPerRow;
        const xPos = margin + (rowIndex * (cardWidth + 15));

        // Draw the stunning card
        drawStunningCard(xPos, yPos, cardWidth, cardHeight, chunk, i);

        // Move to next position
        cardIndex++;
        if (cardIndex % cardsPerRow === 0) {
          yPos += cardHeight + cardSpacing;
        }

        // Reset after 12 cards per page (4 rows of 3)
        if (cardIndex % (cardsPerRow * 4) === 0) {
          yPos = addStunningHeader() + 20;
          if (i < summaryChunks.length - 1) {
            doc.addPage();
            currentPage++;
          }
        }
      }

      // Add footer to last page
      addFooter(currentPage, currentPage);

      // Enhanced metadata
      doc.setProperties({
        title: 'CruxPad Professional Cheatsheet',
        subject: 'AI-Generated Premium Knowledge Summary',
        author: 'CruxPad AI Assistant',
        keywords: 'cheatsheet, summary, AI, knowledge, professional, stunning',
        creator: 'CruxPad v2.0'
      });

      doc.save('cruxpad-stunning-cheatsheet.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  })();
}

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${darkMode
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>

      {/* Loading Overlay */}
      {loading && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-black/70' : 'bg-white/70'}`}>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-4">
              <div className="animate-spin">
                <Sparkles className={`w-8 h-8 ${darkMode ? 'text-purple-300' : 'text-indigo-600'}`} />
              </div>
              <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Processing your content...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse ${darkMode ? 'bg-purple-500' : 'bg-blue-400'
          }`} style={{ filter: 'blur(40px)', animationDuration: '4s' }}></div>

        <div className={`absolute top-3/4 right-1/4 w-48 h-48 rounded-full opacity-20 animate-pulse ${darkMode ? 'bg-blue-500' : 'bg-purple-400'
          }`} style={{ filter: 'blur(30px)', animationDuration: '6s', animationDelay: '2s' }}></div>

        <div className={`absolute top-1/2 left-1/2 w-32 h-32 rounded-full opacity-30 animate-pulse ${darkMode ? 'bg-indigo-500' : 'bg-pink-400'
          }`} style={{ filter: 'blur(20px)', animationDuration: '5s', animationDelay: '1s' }}></div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`border-r ${darkMode ? 'border-white' : 'border-gray-600'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Glass morphism container */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="relative px-6 sm:px-8 pt-6 mb-6 sm:mb-8">
          {/* Theme Toggle in top-right */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-8 right-4 sm:top-6 sm:right-8 
    w-10 h-10 sm:w-11 sm:h-11 
    rounded-xl flex items-center justify-center 
    backdrop-blur-lg transition-all duration-300 z-10
    ${darkMode
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                : 'bg-white/40 hover:bg-white/60 border border-white/30 text-gray-800'
              } shadow-xl hover:shadow-2xl hover:scale-105`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div
              className={`p-2 sm:p-3 rounded-xl backdrop-blur-lg shrink-0 ${darkMode
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/40 border border-white/30'
                } shadow-2xl`}
            >
              <Sparkles
                className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-purple-300' : 'text-indigo-600'
                  }`}
              />
            </div>

            <div className="flex flex-col leading-snug">
              <span
                className={`text-xl sm:text-2xl font-semibold bg-gradient-to-r ${darkMode
                  ? 'from-purple-300 via-pink-300 to-indigo-300'
                  : 'from-indigo-600 via-purple-600 to-pink-600'
                  } bg-clip-text text-transparent`}
              >
                CruxPad
              </span>
              <span
                className={`text-xl sm:text-2xl font-semibold bg-gradient-to-r ${darkMode
                  ? 'from-purple-300 via-pink-300 to-indigo-300'
                  : 'from-indigo-600 via-purple-600 to-pink-600'
                  } bg-clip-text text-transparent`}
              >
                Cheatsheet
              </span>
            </div>
          </div>
        </header>

        <div className="px-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <section className="flex-1 space-y-6">
            <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${darkMode
              ? 'bg-white/5 border-white/10'
              : 'bg-white/30 border-white/40'
              }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                <Upload size={20} />
                Input Your Content
              </h2>

              {/* File Upload */}
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,text/plain"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 group-hover:scale-105 ${darkMode
                  ? 'border-purple-400/50 bg-purple-900/20 hover:border-purple-400 hover:bg-purple-900/30'
                  : 'border-indigo-400/50 bg-indigo-100/50 hover:border-indigo-400 hover:bg-indigo-100/70'
                  }`}>
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-purple-300' : 'text-indigo-600'}`} />
                  <p className={`font-medium ${darkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                    Click to upload PDF or text file
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-indigo-600/70'}`}>
                    or drag and drop
                  </p>
                </div>
              </div>

              {/* Text Area */}
              <div className="mt-4">
                <textarea
                  placeholder="Or paste your text here..."
                  value={inputText}
                  onChange={handleInputChange}
                  rows={12}
                  className={`w-full p-4 rounded-xl resize-none font-mono text-sm leading-relaxed transition-all duration-300 focus:scale-105 focus:shadow-2xl ${darkMode
                    ? 'bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-black/40'
                    : 'bg-white/60 border border-white/40 text-gray-800 placeholder-gray-500 focus:border-indigo-400 focus:bg-white/80'
                    } backdrop-blur-sm shadow-lg focus:outline-none`}
                />
              </div>
            </div>
          </section>

          {/* Output Section */}
          <section className="flex-1">
            <ErrorBoundary
              FallbackComponent={(props) => <ErrorFallback {...props} darkMode={darkMode} />}
              onReset={() => setSummaryChunks([])}
            >
              <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border h-full ${darkMode
                ? 'bg-white/5 border-white/10'
                : 'bg-white/30 border-white/40'
                }`}>
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                  <Sparkles size={20} />
                  Condensed Cheatsheet
                </h2>

                <div className="mb-6 max-h-96 overflow-auto rounded-xl" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: darkMode ? '#4c1d95 #1f2937' : '#6366f1 #e5e7eb'
                }}>
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {summaryChunks.length === 0 && (
                      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="italic">Your beautiful cheatsheet will appear here</p>
                      </div>
                    )}
                    {summaryChunks.map((chunk, i) => {
                      const bgColor = darkMode
                        ? darkColors[i % darkColors.length]
                        : lightColors[i % lightColors.length];
                      return (
                        <div
                          key={i}
                          title={chunk}
                          className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                          style={{
                            backgroundColor: bgColor,
                            padding: '12px 16px',
                            minHeight: '60px',
                            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                          <p className={`text-xs font-medium relative z-10 ${darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`} style={{ wordBreak: 'break-word' }}>
                            {chunk}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={exportTextFile}
                    disabled={summaryChunks.length === 0}
                    className={`group relative overflow-hidden flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${summaryChunks.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 hover:shadow-xl'
                      } ${darkMode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      } shadow-lg`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <Download size={18} />
                      Export Text
                    </div>
                  </button>

                  <button
                    onClick={exportPDF}
                    disabled={summaryChunks.length === 0}
                    className={`group relative overflow-hidden flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${summaryChunks.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 hover:shadow-xl'
                      } ${darkMode
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      } shadow-lg`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Export Stunning PDF ✨
                    </div>
                  </button>
                </div>
              </div>
            </ErrorBoundary>
          </section>
        </div>
      </div>
    </div>
  );
}

// Color palettes (outside component)
const lightColors = [
  '#e3f2fd', '#ffebee', '#e8f5e9', '#fff3e0',
  '#e0f7fa', '#fce4ec', '#f1f8e9', '#fff8e1'
];

const darkColors = [
  '#0d47a1', '#b71c1c', '#1b5e20', '#e65100',
  '#006064', '#4a148c', '#33691e', '#827717'
];