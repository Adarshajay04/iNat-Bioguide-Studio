import React, { useState } from 'react';
import { Compass, BookOpen, Layers, CheckSquare, MapPin, Feather, Heart } from 'lucide-react';

export default function PamphletView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'pamphlet-export-container',
}) {
  const [spreadMode, setSpreadMode] = useState('inside'); // 'inside' | 'outside' | 'both'

  const {
    showCommonNameTop,
    showScientificNameTop,
    nameOrder,
    badgeStyle,
    showAuthorCopyright,
    showLicenseCode,
    bottomStyle,
  } = overlaySettings;

  // Split species evenly across inside panels (e.g. 3 panels)
  const insideSpecies = species.slice(0, 12);
  const panel1 = insideSpecies.slice(0, 4);
  const panel2 = insideSpecies.slice(4, 8);
  const panel3 = insideSpecies.slice(8, 12);

  const heroSpecies = species[0] || {};
  const heroPhoto = heroSpecies.photo?.largeUrl || heroSpecies.photo?.mediumUrl;

  const renderSpeciesTile = (s) => {
    if (!s) return null;
    const photo = s.photo;
    const photoUrl = photo?.largeUrl || photo?.mediumUrl || photo?.squareUrl;
    const authorName = photo?.photographer || 'Contributor';
    const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
    const attributionText = `© ${authorName}${licenseTag}`;

    return (
      <div key={s.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={s.commonName}
              loading="eager"
              onError={(e) => {
                if (photo?.mediumUrl && e.currentTarget.src !== photo.mediumUrl) {
                  e.currentTarget.src = photo.mediumUrl;
                } else if (photo?.squareUrl && e.currentTarget.src !== photo.squareUrl) {
                  e.currentTarget.src = photo.squareUrl;
                }
              }}
              className="w-full h-full object-cover"
            />
          )}

          {/* TOP OVERLAY: Common / Scientific Name */}
          {(showCommonNameTop || showScientificNameTop) && (
            <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-start pointer-events-none">
              <div
                className={`px-1.5 py-0.5 rounded max-w-full truncate ${
                  badgeStyle === 'frosted_dark'
                    ? 'bg-black/70 backdrop-blur-xs text-white'
                    : badgeStyle === 'solid_black'
                    ? 'bg-black/90 text-white'
                    : badgeStyle === 'light'
                    ? 'bg-white/95 text-slate-900'
                    : 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]'
                }`}
              >
                {nameOrder === 'common_first' ? (
                  <>
                    {showCommonNameTop && (
                      <div className="font-bold text-[11px] leading-tight truncate">
                        {s.commonName}
                      </div>
                    )}
                    {showScientificNameTop && (
                      <div className="text-[9px] italic leading-tight truncate opacity-90">
                        {s.scientificName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showScientificNameTop && (
                      <div className="font-bold text-[11px] italic leading-tight truncate">
                        {s.scientificName}
                      </div>
                    )}
                    {showCommonNameTop && (
                      <div className="text-[9px] leading-tight truncate opacity-90">
                        {s.commonName}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM OVERLAY: Author Name as Copyright */}
          {showAuthorCopyright && (
            <div
              className={`absolute bottom-0 left-0 right-0 pointer-events-none ${
                bottomStyle === 'dark_banner'
                  ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1'
                  : 'p-1 flex justify-start'
              }`}
            >
              <div
                className={`text-[8px] font-medium leading-tight truncate ${
                  bottomStyle === 'dark_pill'
                    ? 'bg-black/75 text-slate-200 px-1 py-0.2 rounded'
                    : 'text-slate-100 drop-shadow-sm'
                }`}
              >
                {attributionText}
              </div>
            </div>
          )}
        </div>

        <div className="p-2 flex items-center justify-between">
          <div className="overflow-hidden pr-1">
            <div className="font-bold text-xs text-slate-800 truncate">{s.commonName}</div>
            <div className="text-[10px] italic text-slate-500 font-serif truncate">{s.scientificName}</div>
          </div>
          <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0" title="Check when observed" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Spread Switcher Controls */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 no-print">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tri-Fold Pamphlet Preview Mode:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpreadMode('inside')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              spreadMode === 'inside'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inside Spread (Species Grid)
          </button>
          <button
            type="button"
            onClick={() => setSpreadMode('outside')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              spreadMode === 'outside'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Outside Spread (Cover & Back)
          </button>
          <button
            type="button"
            onClick={() => setSpreadMode('both')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              spreadMode === 'both'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            View Both Spreads
          </button>
        </div>
      </div>

      <div id={id} className="space-y-8 print:space-y-0">
        {/* INSIDE SPREAD (3 Inner Panels: Left, Center, Right) */}
        {(spreadMode === 'inside' || spreadMode === 'both') && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:p-0 print:border-none page-break-after">
            <div className="text-center pb-3 mb-4 border-b border-emerald-800/20 text-xs font-bold text-emerald-800 uppercase tracking-widest">
              🌿 {taxonName || 'Species'} of {placeName || 'Region'} • Inside Field Spread
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Fold Guide Line 1 */}
              <div className="hidden md:block absolute left-1/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-3" />
              {/* Fold Guide Line 2 */}
              <div className="hidden md:block absolute left-2/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-3" />

              {/* Panel 1 (Left) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 1</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                {panel1.map(renderSpeciesTile)}
              </div>

              {/* Panel 2 (Center) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 2</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                {panel2.map(renderSpeciesTile)}
              </div>

              {/* Panel 3 (Right) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 3</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                {panel3.map(renderSpeciesTile)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Fold inward along dashed guidelines to create a pocket tri-fold guide</span>
              <span>iNaturalist Citizen Science</span>
            </div>
          </div>
        )}

        {/* OUTSIDE SPREAD (Left Flap, Center Back Cover, Right Front Cover) */}
        {(spreadMode === 'outside' || spreadMode === 'both') && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:p-0 print:border-none page-break-after">
            <div className="text-center pb-3 mb-4 border-b border-emerald-800/20 text-xs font-bold text-emerald-800 uppercase tracking-widest">
              🌿 {taxonName || 'Species'} of {placeName || 'Region'} • Outside Cover Spread
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Fold Guide Line 1 */}
              <div className="hidden md:block absolute left-1/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-3" />
              {/* Fold Guide Line 2 */}
              <div className="hidden md:block absolute left-2/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-3" />

              {/* Left Column: Inside Flap Checklist */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-1 border-b border-slate-200">
                    Field Checklist
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Check off species observed during your visit:
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {species.slice(0, 10).map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2 font-medium">
                          {idx + 1}. {s.commonName}
                        </span>
                        <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-800 mb-1">Field Observation Tip:</div>
                  Note time of day, weather, and specific habitat (canopy, underbrush, aquatic margin).
                </div>
              </div>

              {/* Center Column: Back Cover */}
              <div className="space-y-4 flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Citizen Science & iNaturalist</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    This guide was compiled from research-grade observations recorded by naturalists worldwide. Every observation contributes to global biodiversity conservation.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 mb-1">Record Your Own Sighting:</div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px]">
                      <li>Download the free iNaturalist app</li>
                      <li>Snap a photo of any plant or animal</li>
                      <li>Share with the global nature community</li>
                    </ol>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2">
                  All images licensed under Creative Commons. Respective author copyright credited on each photograph.
                </div>
              </div>

              {/* Right Column: FRONT COVER */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-xl flex flex-col justify-between shadow-md">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">
                    Pocket Nature Guide
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                    {taxonName || 'Wildlife'}
                  </h2>
                  <div className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{placeName || 'Regional Area'}</span>
                  </div>
                </div>

                {/* Hero Photo */}
                {heroPhoto && (
                  <div className="my-4 rounded-lg overflow-hidden border border-emerald-600/40 shadow-inner relative aspect-4/3">
                    <img
                      src={heroPhoto}
                      alt={heroSpecies.commonName || 'Hero species'}
                      loading="eager"
                      onError={(e) => {
                        const hPhoto = heroSpecies.photo;
                        if (hPhoto?.mediumUrl && e.currentTarget.src !== hPhoto.mediumUrl) {
                          e.currentTarget.src = hPhoto.mediumUrl;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white">
                      {heroSpecies.commonName}
                    </div>
                  </div>
                )}

                <div className="text-center pt-2 border-t border-emerald-700/60 text-[11px] text-emerald-200">
                  <div className="font-semibold text-white">Foldable Field Pamphlet</div>
                  <div>BioGuide Studio</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
