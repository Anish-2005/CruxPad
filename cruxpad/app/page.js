'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { FileText, Download, Moon, Sun, Upload, Sparkles } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  // Process text with Gemini API
  async function processWithGemini(text) {
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


      const response = await fetch(`${process.env.NEXT_PUBLIC_GEMINI_BASE_URL}?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Full Gemini response:', data); // Debug log

      // More flexible response extraction
      let resultText = '';
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        resultText = data.candidates[0].content.parts[0].text;
      } else if (typeof data === 'string') {
        resultText = data;
      } else {
        // Fallback: try to stringify the first part we find
        const firstPart = data.candidates?.[0]?.content?.parts?.[0] ||
          data.choices?.[0]?.message?.content ||
          data.result ||
          JSON.stringify(data).substring(0, 1000);
        resultText = typeof firstPart === 'string' ? firstPart : JSON.stringify(firstPart);
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
      console.error('Gemini processing error:', err);
      alert(`Error processing with Gemini: ${err.message}`);
      return ['Failed to generate content. Please try again.'];
    } finally {
      setLoading(false);
    }
  }

  // Extract text from PDF
  async function extractTextFromPDF(file) {
    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        fullText += strings.join(' ') + '\n\n';
      }
      return fullText;
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
      const chunks = await processWithGemini(text);
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
      const chunks = await processWithGemini(text);
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

function formatGeminiText(text) {
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

  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Layout settings
    const margin = 40;
    const colWidth = (pageWidth - margin * 2) / 3;
    const colGap = 20;
    
    // Theme-based styling
    const theme = {
      light: {
        background: '#f8fafc', // Light blue-50 background
        text: '#1e293b', // Slate-800
        heading: '#4f46e5', // Indigo-600
        subheading: '#7c3aed', // Purple-600
        accent: '#db2777', // Pink-600
        cardBg: '#ffffff',
        cardBorder: '#e2e8f0'
      },
      dark: {
        background: '#0f172a', // Slate-900
        text: '#e2e8f0', // Slate-200
        heading: '#a5b4fc', // Indigo-300
        subheading: '#c4b5fd', // Purple-300
        accent: '#f472b6', // Pink-400
        cardBg: '#1e293b',
        cardBorder: '#334155'
      }
    };

    const currentTheme = darkMode ? theme.dark : theme.light;

    // Initialize document with theme
    doc.setFillColor(currentTheme.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFont('helvetica');

    let currentCol = 0;
    let yPos = margin;
    let xPos = margin;

    // Process each chunk with theme-appropriate formatting
    summaryChunks.forEach(chunk => {
      // Split the text into lines and process each line
      const lines = chunk.split('\n');
      
      lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        let style = {
          size: 10,
          color: currentTheme.text,
          spacing: 6,
          font: 'helvetica'
        };

        // Determine styling based on content
        if (line.match(/^\*[A-Za-z].+\*$/)) { // Section title (e.g., *I. Core Objectives*)
          style = {
            size: 16,
            color: currentTheme.heading,
            spacing: 15,
            font: 'helvetica-bold'
          };
          line = line.replace(/\*/g, '');
        } 
        else if (line.match(/^[A-Z][A-Za-z ]+:$/)) { // Subsection (e.g., "Month 1:")
          style = {
            size: 14,
            color: currentTheme.subheading,
            spacing: 12,
            font: 'helvetica-bold'
          };
        }
        else if (line.match(/\*\*.+\*\*/)) { // Bold text (e.g., **Core Objective**)
          style = {
            size: 10,
            color: currentTheme.accent,
            spacing: 8,
            font: 'helvetica-bold'
          };
          line = line.replace(/\*\*/g, '');
        }

        // Set font properties
        doc.setFontSize(style.size);
        doc.setTextColor(style.color);
        doc.setFont(style.font);

        // Split text to fit column width
        const textLines = doc.splitTextToSize(line, colWidth - 10);
        const neededHeight = textLines.length * (style.size * 1.2);

        // Check if we need new column/page
        if (yPos + neededHeight > pageHeight - margin) {
          currentCol++;
          yPos = margin;
          
          if (currentCol >= 3) {
            currentCol = 0;
            doc.addPage();
            yPos = margin;
            // Apply theme to new page
            doc.setFillColor(currentTheme.background);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
          }
        }
        
        xPos = margin + (currentCol * (colWidth + colGap));
        
        // Add the text
        textLines.forEach((textLine, i) => {
          doc.text(textLine, xPos, yPos + (i * style.size * 1.2));
        });
        
        yPos += neededHeight + style.spacing;
      });
    });

    // Add footer with watermark
    doc.setFontSize(8);
    doc.setTextColor(darkMode ? '#94a3b8' : '#64748b');
    doc.text('Generated by CruxPad Cheatsheet', pageWidth - margin, pageHeight - 20, null, null, 'right');

    doc.save('cruxpad-cheatsheet.pdf');
  } catch (err) {
    console.error('PDF export error:', err);
    alert(`Failed to generate PDF: ${err.message}`);
  }
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
                      Export PDF
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