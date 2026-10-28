import React from 'react';
import { Compass, Leaf, Printer, Sliders, Sun, Moon } from 'lucide-react';

export default function Navbar({
  onOpenExport,
  speciesCount,
  onToggleSettings,
  showSettings,
  darkMode,
  onToggleDarkMode,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs border-b border-stone-200/90 dark:border-stone-800 no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Authentic Naturalist Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Leaf className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                BioGuide Studio
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 rounded border border-emerald-200/70 dark:border-emerald-800/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block"></span>
                iNaturalist Data
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden md:block">
              Field Guide, Pamphlet & Pocket Guide Generator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-amber-400 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Formatting & Overlays Toggle */}
          <button
            type="button"
            onClick={onToggleSettings}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showSettings
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
            title="Configure species plate typography and attributions"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            <span className="hidden sm:inline">Plate Formatting</span>
          </button>

          {/* Export & Publication Button */}
          <button
            type="button"
            onClick={onOpenExport}
            disabled={speciesCount === 0}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              speciesCount > 0
                ? 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed border border-stone-200 dark:border-stone-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export & Print</span>
            {speciesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/40 text-emerald-100 font-mono">
                {speciesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}