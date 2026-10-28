import React from 'react';
import { Type, ShieldAlert, Eye, Layers } from 'lucide-react';

export default function OverlayControls({
  overlaySettings,
  setOverlaySettings,
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  const {
    showCommonNameTop,
    showScientificNameTop,
    nameOrder, // 'common_first' | 'scientific_first'
    badgeStyle, // 'frosted_dark' | 'solid_black' | 'light' | 'minimal'
    topPosition, // 'top-left' | 'top-center' | 'top-banner'
    showAuthorCopyright,
    showLicenseCode,
    bottomStyle, // 'dark_pill' | 'dark_banner' | 'minimal'
  } = overlaySettings;

  const updateSetting = (key, val) => {
    setOverlaySettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-4 sm:p-5 mb-4 transition-colors no-print">
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Plate Typography & Overlay Formatting
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Configure Latin binomial hierarchy, attribution overlays, and plate badge styling
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Close ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left column: Top Overlay (Names) */}
        <div className="lg:col-span-4 bg-stone-50 dark:bg-stone-850 rounded-lg p-3 border border-stone-200/80 dark:border-stone-750">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Type className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Species Name Badges
            </h4>
          </div>

          <div className="space-y-2">
            {/* Common Name Checkbox */}
            <label className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
              <input
                type="checkbox"
                checked={showCommonNameTop}
                onChange={(e) => updateSetting('showCommonNameTop', e.target.checked)}
                className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
              />
              <div className="text-xs">
                <span className="font-medium text-stone-800 dark:text-stone-100 block">Common Name</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">
                  e.g., "Red-tailed Hawk"
                </span>
              </div>
            </label>

            {/* Scientific Name Checkbox */}
            <label className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
              <input
                type="checkbox"
                checked={showScientificNameTop}
                onChange={(e) => updateSetting('showScientificNameTop', e.target.checked)}
                className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
              />
              <div className="text-xs">
                <span className="font-medium text-stone-800 dark:text-stone-100 block">Scientific Binomial</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px] italic font-serif">
                  e.g., Buteo jamaicensis
                </span>
              </div>
            </label>

            {/* Order selector if both are enabled */}
            {showCommonNameTop && showScientificNameTop && (
              <div className="pt-1">
                <label className="block text-[10px] font-medium text-stone-600 dark:text-stone-400 uppercase mb-1">
                  Name Order
                </label>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => updateSetting('nameOrder', 'common_first')}
                    className={`px-2 py-1 rounded border transition-colors cursor-pointer text-xs ${
                      nameOrder === 'common_first'
                        ? 'bg-emerald-800 text-white border-emerald-800 font-medium'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Common First
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('nameOrder', 'scientific_first')}
                    className={`px-2 py-1 rounded border transition-colors cursor-pointer text-xs ${
                      nameOrder === 'scientific_first'
                        ? 'bg-emerald-800 text-white border-emerald-800 font-medium'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Latin First
                  </button>
                </div>
              </div>
            )}

            {/* Overlay Badge Theme */}
            <div className="pt-1">
              <label className="block text-[10px] font-medium text-stone-600 dark:text-stone-400 uppercase mb-1">
                Badge Appearance
              </label>
              <select
                value={badgeStyle}
                onChange={(e) => updateSetting('badgeStyle', e.target.value)}
                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="frosted_dark">Subtle Dark Glass (Default)</option>
                <option value="solid_black">Solid Black Pill</option>
                <option value="light">Crisp White Badge</option>
                <option value="minimal">Drop Shadow Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Center column: Bottom Overlay (Copyright & Attribution) */}
        <div className="lg:col-span-4 bg-stone-50 dark:bg-stone-850 rounded-lg p-3 border border-stone-200/80 dark:border-stone-750">
          <div className="flex items-center gap-1.5 mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Photographic Attribution
            </h4>
          </div>

          <div className="space-y-2">
            {/* Show Author Copyright Toggle */}
            <label className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
              <input
                type="checkbox"
                checked={showAuthorCopyright}
                onChange={(e) => updateSetting('showAuthorCopyright', e.target.checked)}
                className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
              />
              <div className="text-xs">
                <span className="font-medium text-stone-800 dark:text-stone-100 block">
                  Author Copyright Watermark
                </span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">
                  e.g., "© Craig K. Hunt"
                </span>
              </div>
            </label>

            {/* Include License Code Toggle */}
            <label className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
              <input
                type="checkbox"
                checked={showLicenseCode}
                onChange={(e) => updateSetting('showLicenseCode', e.target.checked)}
                className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
              />
              <div className="text-xs">
                <span className="font-medium text-stone-800 dark:text-stone-100 block">License Code Indicator</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">
                  Appends license, e.g. "(CC BY-NC 4.0)"
                </span>
              </div>
            </label>

            {/* Bottom Style */}
            <div className="pt-1">
              <label className="block text-[10px] font-medium text-stone-600 dark:text-stone-400 uppercase mb-1">
                Attribution Style
              </label>
              <select
                value={bottomStyle}
                onChange={(e) => updateSetting('bottomStyle', e.target.value)}
                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="dark_pill">Quiet Pill (Bottom Left)</option>
                <option value="dark_banner">Linear Gradient Baseline</option>
                <option value="minimal">Minimal Drop Shadow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Live Sample Preview */}
        <div className="lg:col-span-4 bg-stone-900 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-400" />
              Plate Preview
            </span>
            <span className="text-[10px] text-stone-500 font-mono">Live</span>
          </div>

          <div className="relative rounded overflow-hidden border border-stone-800 aspect-4/3 bg-stone-800">
            <img
              src="https://images.weserv.nl/?url=https%3A%2F%2Finaturalist-open-data.s3.amazonaws.com%2Fphotos%2F101327658%2Fmedium.jpg"
              alt="Specimen preview"
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />

            {/* Simulated Top Overlay */}
            {(showCommonNameTop || showScientificNameTop) && (
              <div
                className={`absolute top-2 left-2 right-2 flex ${
                  topPosition === 'top-center' ? 'justify-center' : 'justify-start'
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded max-w-full truncate ${
                    badgeStyle === 'frosted_dark'
                      ? 'bg-stone-900/80 backdrop-blur-xs text-white border border-white/10 shadow-xs'
                      : badgeStyle === 'solid_black'
                      ? 'bg-black/90 text-white shadow-xs'
                      : badgeStyle === 'light'
                      ? 'bg-white/95 text-stone-900 shadow-xs'
                      : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {nameOrder === 'common_first' ? (
                    <>
                      {showCommonNameTop && (
                        <div className="font-semibold text-xs leading-tight truncate">
                          Red-tailed Hawk
                        </div>
                      )}
                      {showScientificNameTop && (
                        <div
                          className={`text-[10px] italic leading-tight truncate font-serif ${
                            badgeStyle === 'light' ? 'text-stone-600' : 'text-stone-300'
                          }`}
                        >
                          Buteo jamaicensis
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {showScientificNameTop && (
                        <div className="font-semibold text-xs italic leading-tight truncate font-serif">
                          Buteo jamaicensis
                        </div>
                      )}
                      {showCommonNameTop && (
                        <div
                          className={`text-[10px] leading-tight truncate ${
                            badgeStyle === 'light' ? 'text-stone-600' : 'text-stone-300'
                          }`}
                        >
                          Red-tailed Hawk
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Simulated Bottom Overlay */}
            {showAuthorCopyright && (
              <div
                className={`absolute bottom-0 left-0 right-0 ${
                  bottomStyle === 'dark_banner'
                    ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 text-left'
                    : 'p-1.5 flex justify-start'
                }`}
              >
                <div
                  className={`text-[9px] font-mono leading-tight truncate ${
                    bottomStyle === 'dark_pill'
                      ? 'bg-stone-900/80 text-stone-200 px-1.5 py-0.5 rounded border border-white/10'
                      : 'text-stone-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  © Craig K. Hunt {showLicenseCode ? '(CC BY-NC 4.0)' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}