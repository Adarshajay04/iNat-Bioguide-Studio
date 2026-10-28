import React, { useState } from 'react';
import { Compass, BookOpen, MapPin, RefreshCw, Loader2 } from 'lucide-react';

export default function PamphletView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'pamphlet-export-container',
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
  const [spreadMode, setSpreadMode] = useState('both'); // 'both' | 'inside' | 'outside'

  const {
    showCommonNameTop,
    showScientificNameTop,
    nameOrder,
    badgeStyle,
    topPosition,
    showAuthorCopyright,
    showLicenseCode,
    bottomStyle,
  } = overlaySettings;

  // In an authentic tri-fold brochure, feature 2 prominent species per panel (6 total featured inside)
  const insideSpecies = species.slice(0, 6);
  const panel1 = insideSpecies.slice(0, 2);
  const panel2 = insideSpecies.slice(2, 4);
  const panel3 = insideSpecies.slice(4, 6);

  const heroSpecies = species[0] || {};
  const heroPhoto = heroSpecies.photo?.mediumUrl || heroSpecies.photo?.largeUrl;

  const renderSpeciesTile = (s) => {
    if (!s) return null;
    const photo = s.photo;
    const photoUrl = photo?.mediumUrl || photo?.largeUrl || photo?.squareUrl;
    const authorName = photo?.photographer || 'Contributor';
    const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
    const attributionText = `© ${authorName}${licenseTag}`;

    return (
      <div key={s.id} className="border border-stone-200 rounded-2xs overflow-hidden bg-white shadow-2xs flex flex-col justify-between">
        <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={s.commonName}
              crossOrigin="anonymous"
              loading="eager"
              onError={(e) => {
                if (photo?.squareUrl && e.currentTarget.src !== photo.squareUrl) {
                  e.currentTarget.src = photo.squareUrl;
                }
              }}
              className="w-full h-full object-cover"
            />
          )}

          {/* PHOTO SWITCHER (Interactive in preview, excluded from print/PDF) */}
          {onChangePhoto && (
            <button
              type="button"
              data-export-ignore="true"
              onClick={(e) => {
                e.stopPropagation();
                onChangePhoto(s.id, 1);
              }}
              disabled={loadingPhotoSpeciesId === s.id}
              className="no-print export-ignore absolute top-1 right-1 z-20 bg-stone-900/85 hover:bg-black text-white text-[7.5px] font-mono px-1.5 py-0.5 rounded-2xs border border-white/20 transition-all cursor-pointer"
              title="Switch photo for better visibility"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-2 h-2 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-2 h-2 text-stone-300" />
              )}
              <span>{s.photosList && s.photosList.length > 1 ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}` : 'Alt'}</span>
            </button>
          )}

          {/* TOP OVERLAY: Common / Scientific Name */}
          {(showCommonNameTop || showScientificNameTop) && (
            <div
              className={`absolute top-1 left-1 right-1 flex pointer-events-none ${
                topPosition === 'top-center'
                  ? 'justify-center'
                  : topPosition === 'top-right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`px-1.5 py-0.5 rounded-2xs max-w-full truncate ${
                  badgeStyle === 'frosted_dark'
                    ? 'bg-stone-900/85 text-white border border-white/10'
                    : badgeStyle === 'solid_black'
                    ? 'bg-black text-white'
                    : badgeStyle === 'light'
                    ? 'bg-white/95 text-stone-900 border border-stone-200'
                    : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                }`}
              >
                {nameOrder === 'common_first' ? (
                  <>
                    {showCommonNameTop && (
                      <div className="font-semibold text-[9.5px] leading-tight truncate">
                        {s.commonName}
                      </div>
                    )}
                    {showScientificNameTop && (
                      <div className="text-[8px] italic font-serif leading-tight truncate text-stone-300">
                        {s.scientificName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showScientificNameTop && (
                      <div className="font-semibold text-[9.5px] italic font-serif leading-tight truncate">
                        {s.scientificName}
                      </div>
                    )}
                    {showCommonNameTop && (
                      <div className="text-[8px] leading-tight truncate text-stone-300">
                        {s.commonName}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM OVERLAY: Author Name */}
          {showAuthorCopyright && (
            <div
              className={`absolute bottom-0 left-0 right-0 z-10 pointer-events-none ${
                bottomStyle === 'dark_banner'
                  ? 'bg-stone-900/80 p-0.5'
                  : 'p-0.5 flex justify-start'
              }`}
            >
              <div
                className={`text-[7.5px] font-mono leading-tight truncate ${
                  bottomStyle === 'dark_pill'
                    ? 'bg-stone-900/85 text-stone-200 px-1 py-0.2 rounded-2xs'
                    : 'text-stone-100 drop-shadow-xs'
                }`}
              >
                {attributionText}
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="p-2 leading-tight">
          <div className="font-semibold text-xs text-stone-900 truncate">
            {s.commonName}
          </div>
          <div className="text-[10px] italic font-serif text-stone-600 truncate">
            {s.scientificName}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Spread Selector Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs no-print text-xs transition-colors duration-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span className="font-semibold text-stone-700 dark:text-stone-300">Tri-fold Spread View:</span>
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setSpreadMode('both')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                spreadMode === 'both' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Both Pages (Full Brochure)
            </button>
            <button
              type="button"
              onClick={() => setSpreadMode('inside')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                spreadMode === 'inside' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Inside Spread
            </button>
            <button
              type="button"
              onClick={() => setSpreadMode('outside')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                spreadMode === 'outside' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Outside Cover Spread
            </button>
          </div>
        </div>
        <div className="text-[11px] font-mono text-stone-500 hidden sm:block">
          US Letter / A4 Landscape • Folds into 3 Panels
        </div>
      </div>

      {/* Main Pamphlet Container */}
      <div id={id} className="max-w-5xl mx-auto space-y-6 print:space-y-0">
        {/* PAGE 1: INSIDE SPREAD (3 Panels) */}
        {(spreadMode === 'inside' || spreadMode === 'both') && (
          <div
            className="pdf-page bg-white text-stone-900 p-6 sm:p-8 rounded-none shadow-xs border border-stone-300 page-break-after flex flex-col justify-between"
            style={{ aspectRatio: '297 / 210', minHeight: '600px' }}
          >
            {/* Header */}
            <div className="text-center pb-2 mb-4 border-b border-stone-300 text-xs font-mono font-semibold uppercase tracking-widest flex items-center justify-between text-stone-700">
              <span>{taxonName || 'Species'} of {placeName || 'Region'}</span>
              <span className="text-[10px] text-stone-400 font-normal">Page 1 • Inside Panels</span>
            </div>

            {/* 3 Panels */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 relative flex-1">
              {/* Fold Guide Line 1 */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-stone-300 pointer-events-none -ml-2" />
              {/* Fold Guide Line 2 */}
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-dashed border-stone-300 pointer-events-none -ml-2" />

              {/* Panel 1 (Left) */}
              <div className="space-y-2.5 flex flex-col justify-between">
                <div className="text-xs font-mono font-semibold text-stone-700 uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center justify-between">
                  <span>Panel 1</span>
                  <span className="text-[10px] text-stone-400">Featured Taxa</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {panel1.map(renderSpeciesTile)}
                </div>
              </div>

              {/* Panel 2 (Center) */}
              <div className="space-y-2.5 flex flex-col justify-between">
                <div className="text-xs font-mono font-semibold text-stone-700 uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center justify-between">
                  <span>Panel 2</span>
                  <span className="text-[10px] text-stone-400">Featured Taxa</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {panel2.map(renderSpeciesTile)}
                </div>
              </div>

              {/* Panel 3 (Right) */}
              <div className="space-y-2.5 flex flex-col justify-between">
                <div className="text-xs font-mono font-semibold text-stone-700 uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center justify-between">
                  <span>Panel 3</span>
                  <span className="text-[10px] text-stone-400">Featured Taxa</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {panel3.map(renderSpeciesTile)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-stone-200 text-[10px] font-mono text-stone-400 flex items-center justify-between">
              <span>Fold inward along dashed guidelines to form tri-fold brochure</span>
              <span>Research-Grade Data via iNaturalist</span>
            </div>
          </div>
        )}

        {/* PAGE 2: OUTSIDE SPREAD (Left Flap, Center Back Cover, Right Front Cover) */}
        {(spreadMode === 'outside' || spreadMode === 'both') && (
          <div
            className="pdf-page bg-white text-stone-900 p-6 sm:p-8 rounded-none shadow-xs border border-stone-300 page-break-after flex flex-col justify-between"
            style={{ aspectRatio: '297 / 210', minHeight: '600px' }}
          >
            <div className="text-center pb-2 mb-4 border-b border-stone-300 text-xs font-mono font-semibold text-stone-700 uppercase tracking-widest flex items-center justify-between">
              <span>{taxonName || 'Species'} of {placeName || 'Region'}</span>
              <span className="text-[10px] text-stone-400 font-normal">Page 2 • Outside Cover Spread</span>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 relative flex-1">
              {/* Fold Guide Line 1 */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-stone-300 pointer-events-none -ml-2" />
              {/* Fold Guide Line 2 */}
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-dashed border-stone-300 pointer-events-none -ml-2" />

              {/* Left Column: Inside Flap Checklist */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider pb-1 border-b border-stone-200 font-mono">
                    Field Checklist
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 mb-2">
                    Check off species during your field survey:
                  </p>
                  <div className="space-y-1 text-xs text-stone-700">
                    {species.slice(0, 8).map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="truncate pr-2 font-medium text-[11px]">
                          {idx + 1}. {s.commonName}
                        </span>
                        <div className="w-3 h-3 border border-stone-400 rounded-2xs shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-2xs border border-stone-200 text-[10px] text-stone-600 font-mono">
                  <div className="font-semibold text-stone-800 mb-0.5">Observation Log:</div>
                  Record observation date, locality, and plumage characteristics.
                </div>
              </div>

              {/* Center Column: Back Cover */}
              <div className="space-y-3 flex flex-col justify-between bg-stone-50 p-4 rounded-2xs border border-stone-200">
                <div>
                  <div className="w-7 h-7 rounded-2xs bg-[#1a382b] text-white flex items-center justify-center mb-2">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider font-mono">
                    Citizen Science & Research
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                    This guide was compiled from research-grade observations. Verified observations contribute to conservation monitoring and ecological science worldwide.
                  </p>

                  <div className="mt-3 pt-2 border-t border-stone-200 text-[11px] text-stone-600">
                    <div className="font-semibold text-stone-800 mb-1 font-mono text-[10px]">How to Contribute:</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px] font-mono">
                      <li>Open the free iNaturalist application</li>
                      <li>Photograph organism encountered</li>
                      <li>Submit observation for species verification</li>
                    </ol>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-stone-400 border-t border-stone-200 pt-1.5">
                  All imagery licensed under Creative Commons. Respective author copyright credited on each photograph.
                </div>
              </div>

              {/* Right Column: FRONT COVER */}
              <div className="bg-[#1a382b] text-white p-5 rounded-none flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-[#e5ca80] mb-1 font-mono">
                    Tri-Fold Field Pamphlet
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-white font-serif leading-tight">
                    {taxonName || 'Fauna & Flora'}
                  </h2>
                  <div className="text-xs text-stone-200 mt-0.5 font-serif italic">
                    of {placeName || 'Region'}
                  </div>
                </div>

                {/* Hero specimen photo */}
                <div className="my-3 flex-1 min-h-[140px] max-h-[180px] rounded-2xs overflow-hidden border border-white/20 relative bg-stone-900">
                  {heroPhoto ? (
                    <img
                      src={heroPhoto}
                      alt={heroSpecies.commonName || 'Hero specimen'}
                      crossOrigin="anonymous"
                      loading="eager"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                      Representative Specimen
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-stone-900/90 p-1.5 border-t border-white/10">
                    <div className="font-semibold text-[10px] text-white leading-tight">
                      {heroSpecies.commonName || 'Key Regional Species'}
                    </div>
                    <div className="text-[8px] italic font-serif text-[#e5ca80] leading-tight">
                      {heroSpecies.scientificName}
                    </div>
                  </div>
                </div>

                {/* Cover footer */}
                <div className="border-t border-white/20 pt-2 text-[8px] font-mono text-stone-300 flex items-center justify-between">
                  <span>Pocket Field Pamphlet</span>
                  <span className="font-semibold text-white">Front Cover</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-stone-200 text-[10px] font-mono text-stone-400 flex items-center justify-between">
              <span>BioGuide Studio Publishing Engine</span>
              <span>Side B • Cover Spread</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
