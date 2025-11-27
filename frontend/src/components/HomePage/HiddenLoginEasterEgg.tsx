import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function HiddenLoginEasterEgg() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-8 right-8 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Subtle decorative element that triggers the easter egg */}
        <div className="w-12 h-12 rounded-full bg-steel-700/30 dark:bg-steel-600/30 backdrop-blur-sm border border-steel-600/50 dark:border-steel-500/50 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-steel-600/50 dark:hover:bg-steel-500/50">
          <div className="w-2 h-2 rounded-full bg-copper-400/50"></div>
        </div>

        {/* Hidden login link that appears on hover */}
        <div
          className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ${
            isHovered
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-steel-800 dark:bg-steel-700 text-white rounded-lg shadow-lg border border-steel-600 dark:border-steel-500 hover:bg-steel-700 dark:hover:bg-steel-600 transition-colors whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">CRM Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

