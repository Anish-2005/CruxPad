import { Sparkles, Download, FileText } from 'lucide-react';
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

// Color palettes (outside component)
const lightColors = [
  '#e3f2fd', '#ffebee', '#e8f5e9', '#fff3e0',
  '#e0f7fa', '#fce4ec', '#f1f8e9', '#fff8e1'
];

const darkColors = [
  '#0d47a1', '#b71c1c', '#1b5e20', '#e65100',
  '#006064', '#4a148c', '#33691e', '#827717'
];

export function OutputSection({ darkMode, summaryChunks, onExportText, onExportPDF }) {
  return (
    <section className="flex-1">
      <ErrorBoundary
        FallbackComponent={(props) => <ErrorFallback {...props} darkMode={darkMode} />}
        onReset={() => {}}
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

          <div className={`mb-6 max-h-96 overflow-auto rounded-xl ${darkMode ? 'dark-scrollbars' : 'light-scrollbars'}`}>
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
              onClick={onExportText}
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
              onClick={onExportPDF}
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
  );
}