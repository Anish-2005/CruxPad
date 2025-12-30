// AI processing functions
export async function processWithAI(text) {
  try {
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
  }
}

// PDF extraction
export async function extractTextFromPDF(file) {
  try {
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
  }
}

// Text file export
export function exportTextFile(summaryChunks) {
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

// PDF export
export function exportPDF(summaryChunks, darkMode) {
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