import React from 'react';
import { Compass, Sparkles, BookOpen, Printer, Sliders } from 'lucide-react';

export default function Navbar({ onOpenExport, speciesCount, onToggleSettings, showSettings }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                BioGuide Studio
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                iNaturalist API
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Generate custom field guides, pamphlets & posters from citizen science data
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleSettings}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showSettings
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Configure photo overlays & text settings"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Overlay Settings</span>
          </button>

          <button
            onClick={onOpenExport}
            disabled={speciesCount === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${
              speciesCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
