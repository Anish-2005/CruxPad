import { Sparkles } from 'lucide-react';

export function LoadingOverlay({ loading, darkMode }) {
  if (!loading) return null;

  return (
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
  );
}