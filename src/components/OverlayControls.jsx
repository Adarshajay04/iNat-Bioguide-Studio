import React from 'react';
import { Type, ShieldAlert, Sparkles, Eye, CheckSquare, Square, Layers, Palette } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-200/80 p-5 sm:p-6 mb-8 transition-all animate-in fade-in-50 duration-200 no-print">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Image Overlay & Typography Customizer
            </h3>
            <p className="text-xs text-slate-500">
              Customize scientific name, common name, and photographer attribution badges on each photo
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Close Customizer ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Top Overlay (Names) */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Top of Picture: Name Overlays
            </h4>
          </div>

          <div className="space-y-3">
            {/* Common Name Checkbox */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={showCommonNameTop}
                onChange={(e) => updateSetting('showCommonNameTop', e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Show Common Name on Top</span>
                <span className="text-slate-500 text-[11px]">
                  e.g., "Red-tailed Hawk", "Monarch Butterfly"
                </span>
              </div>
            </label>

            {/* Scientific Name Checkbox */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={showScientificNameTop}
                onChange={(e) => updateSetting('showScientificNameTop', e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Show Scientific Name on Top</span>
                <span className="text-slate-500 text-[11px]">
                  e.g., <em className="italic">Buteo jamaicensis</em> (Latin binomial)
                </span>
              </div>
            </label>

            {/* Order selector if both are enabled */}
            {showCommonNameTop && showScientificNameTop && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Name Hierarchy Order
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateSetting('nameOrder', 'common_first')}
                    className={`px-2 py-1.5 text-xs rounded-md border font-medium transition-all ${
                      nameOrder === 'common_first'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Common First
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('nameOrder', 'scientific_first')}
                    className={`px-2 py-1.5 text-xs rounded-md border font-medium transition-all ${
                      nameOrder === 'scientific_first'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Scientific First
                  </button>
                </div>
              </div>
            )}

            {/* Overlay Badge Theme */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Badge Background Style
              </label>
              <select
                value={badgeStyle}
                onChange={(e) => updateSetting('badgeStyle', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="frosted_dark">Frosted Glass Dark (Recommended)</option>
                <option value="solid_black">Solid Black Pill</option>
                <option value="light">Crisp White Badge</option>
                <option value="minimal">Minimal / Drop Shadow Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Center column: Bottom Overlay (Copyright & Attribution) */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Bottom of Picture: Copyright Attribution
            </h4>
          </div>

          <div className="space-y-3">
            {/* Show Author Copyright Toggle */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={showAuthorCopyright}
                onChange={(e) => updateSetting('showAuthorCopyright', e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Display Author's Name as Copyright
                </span>
                <span className="text-slate-500 text-[11px]">
                  e.g., "© Craig K. Hunt" (Mandatory for Creative Commons)
                </span>
              </div>
            </label>

            {/* Include License Code Toggle */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={showLicenseCode}
                onChange={(e) => updateSetting('showLicenseCode', e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Include License Badge</span>
                <span className="text-slate-500 text-[11px]">
                  Appends license badge, e.g., "(CC BY-NC)" or "(CC0)"
                </span>
              </div>
            </label>

            {/* Bottom Style */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Bottom Credit Style
              </label>
              <select
                value={bottomStyle}
                onChange={(e) => updateSetting('bottomStyle', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="dark_pill">Subtle Bottom-Left Pill</option>
                <option value="dark_banner">Full-Width Dark Gradient</option>
                <option value="minimal">Minimal Text Overlay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Live Sample Preview */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl p-4 text-white shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Live Image Preview
            </span>
            <span className="text-[10px] text-slate-400">Updates in real time</span>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-4/3 bg-slate-800 shadow-lg">
            <img
              src="https://inaturalist-open-data.s3.amazonaws.com/photos/101327658/medium.jpg"
              alt="Sample species"
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
                  className={`px-2.5 py-1.5 rounded-lg max-w-full truncate ${
                    badgeStyle === 'frosted_dark'
                      ? 'bg-black/65 backdrop-blur-md text-white border border-white/10 shadow-md'
                      : badgeStyle === 'solid_black'
                      ? 'bg-black/90 text-white shadow-md'
                      : badgeStyle === 'light'
                      ? 'bg-white/95 text-slate-900 shadow-md'
                      : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                  }`}
                >
                  {nameOrder === 'common_first' ? (
                    <>
                      {showCommonNameTop && (
                        <div className="font-bold text-xs sm:text-sm leading-tight truncate">
                          Red-tailed Hawk
                        </div>
                      )}
                      {showScientificNameTop && (
                        <div
                          className={`text-[11px] italic truncate leading-tight ${
                            badgeStyle === 'light' ? 'text-slate-600' : 'text-slate-300'
                          }`}
                        >
                          Buteo jamaicensis
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {showScientificNameTop && (
                        <div className="font-bold text-xs sm:text-sm italic leading-tight truncate">
                          Buteo jamaicensis
                        </div>
                      )}
                      {showCommonNameTop && (
                        <div
                          className={`text-[11px] truncate leading-tight ${
                            badgeStyle === 'light' ? 'text-slate-600' : 'text-slate-300'
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
                    ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left'
                    : 'p-2 flex justify-start'
                }`}
              >
                <div
                  className={`text-[10px] font-medium leading-tight truncate ${
                    bottomStyle === 'dark_pill'
                      ? 'bg-black/70 backdrop-blur-xs text-slate-200 px-2 py-0.5 rounded-md border border-white/10'
                      : 'text-slate-200 drop-shadow-sm'
                  }`}
                >
                  © Craig K. Hunt {showLicenseCode ? '(CC BY-NC)' : ''}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-400">
            This card preview applies uniformly across list, PDF, pamphlet, and poster exports.
          </div>
        </div>
      </div>
    </div>
  );
}
