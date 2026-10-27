import React from 'react';
import { Compass, Sparkles, BookOpen, Printer, Sliders, Sun, Moon } from 'lucide-react';

export default function Navbar({
  onOpenExport,
  speciesCount,
  onToggleSettings,
  showSettings,
  darkMode,
  onToggleDarkMode,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                BioGuide Studio
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                iNaturalist API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Generate custom field guides, pamphlets & pocket guides from citizen science data
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-400 border-slate-200 dark:border-slate-700 shadow-2xs"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Overlay Customizer Button */}
          <button
            type="button"
            onClick={onToggleSettings}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              showSettings
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
            title="Configure photo overlays & typography"
          >
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Overlay Settings</span>
          </button>

          {/* Export & Print Button */}
          <button
            type="button"
            onClick={onOpenExport}
            disabled={speciesCount === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer ${
              speciesCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent dark:border-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Export & Print</span>
            {speciesCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-emerald-800/40 text-emerald-100 rounded-full font-bold">
                {speciesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
