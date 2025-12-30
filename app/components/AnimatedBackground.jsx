export function AnimatedBackground({ darkMode }) {
  return (
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
  );
}