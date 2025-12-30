import { Sun, Moon } from 'lucide-react';

export function Header({ darkMode, onToggleDarkMode }) {
  return (
    <header className="relative px-6 sm:px-8 pt-6 mb-6 sm:mb-8">
      {/* Theme Toggle in top-right */}
      <button
        onClick={onToggleDarkMode}
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
          <img
            src="/cruxpad.png"
            alt="CruxPad Logo"
            className="w-10 h-10 sm:w-8 sm:h-8 object-contain"
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
  );
}