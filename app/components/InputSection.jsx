import { Upload, FileText } from 'lucide-react';

export function InputSection({ darkMode, inputText, onInputChange, onFileChange, fileInputRef }) {
  return (
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
            ref={fileInputRef}
            type="file"
            accept=".pdf,text/plain"
            onChange={onFileChange}
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
            onChange={onInputChange}
            rows={12}
            className={`w-full p-4 rounded-xl resize-none font-mono text-sm leading-relaxed transition-all duration-300 focus:scale-105 focus:shadow-2xl ${darkMode
              ? 'bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-black/40'
              : 'bg-white/60 border border-white/40 text-gray-800 placeholder-gray-500 focus:border-indigo-400 focus:bg-white/80'
              } backdrop-blur-sm shadow-lg focus:outline-none`}
          />
        </div>
      </div>
    </section>
  );
}