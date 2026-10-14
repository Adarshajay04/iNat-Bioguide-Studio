import React, { useState } from 'react';
import { Compass, BookOpen, MapPin, Feather, RefreshCw, Loader2 } from 'lucide-react';

export default function PamphletView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'pamphlet-export-container',
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
  const [spreadMode, setSpreadMode] = useState('both'); // Default to 'both' so both pages are available for full brochure export

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
  // Remaining species are listed in the field checklist on the inside flap!
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
      <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs flex flex-col justify-between">
        <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
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
              className="no-print export-ignore absolute top-1 right-1 z-20 bg-black/75 hover:bg-black/95 active:scale-95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20 transition-all cursor-pointer"
              title="Click to switch photo if the bird's face is obscured"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-2.5 h-2.5 text-emerald-400" />
              )}
              <span>{s.photosList && s.photosList.length > 1 ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}` : 'Photo'}</span>
            </button>
          )}

          {/* TOP OVERLAY: Common / Scientific Name */}
          {(showCommonNameTop || showScientificNameTop) && (
            <div
              className={`absolute top-1.5 left-1.5 right-1.5 flex pointer-events-none ${
                topPosition === 'top-center'
                  ? 'justify-center'
                  : topPosition === 'top-right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
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
                      <div className="font-bold text-[10px] leading-tight truncate">
                        {s.commonName}
                      </div>
                    )}
                    {showScientificNameTop && (
                      <div className="text-[8.5px] italic leading-tight truncate opacity-90">
                        {s.scientificName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showScientificNameTop && (
                      <div className="font-bold text-[10px] italic leading-tight truncate">
                        {s.scientificName}
                      </div>
                    )}
                    {showCommonNameTop && (
                      <div className="text-[8.5px] leading-tight truncate opacity-90">
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

        <div className="p-2.5 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <div className="font-bold text-xs text-slate-900 truncate">{s.commonName}</div>
            <div className="text-[10px] italic text-slate-500 font-serif truncate">{s.scientificName}</div>
          </div>
          <div className="w-4 h-4 border border-slate-400 rounded-xs shrink-0" title="Check when observed" />
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
            Tri-Fold Brochure Spread:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpreadMode('both')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              spreadMode === 'both'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Both Spreads (2-Page Brochure)
          </button>
          <button
            type="button"
            onClick={() => setSpreadMode('inside')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              spreadMode === 'inside'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inside Spread Only
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
            Outside Spread Only
          </button>
        </div>
      </div>

      <div id={id} className="space-y-8 print:space-y-0">
        {/* PAGE 1: INSIDE SPREAD (3 Inner Panels: Left, Center, Right) */}
        {(spreadMode === 'inside' || spreadMode === 'both') && (
          <div
            className="pdf-page bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 page-break-after flex flex-col justify-between"
            style={{ aspectRatio: '297 / 210', minHeight: '600px' }}
          >
            <div className="text-center pb-3 mb-4 border-b border-emerald-800/20 text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-between">
              <span>🌿 {taxonName || 'Species'} of {placeName || 'Region'}</span>
              <span className="text-[10px] text-slate-400 font-normal">Page 1 • Inside Field Spread</span>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 relative flex-1">
              {/* Fold Guide Line 1 */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-2" />
              {/* Fold Guide Line 2 */}
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-2" />

              {/* Panel 1 (Left) */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 1</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                <div className="space-y-3 flex-1">
                  {panel1.map(renderSpeciesTile)}
                </div>
              </div>

              {/* Panel 2 (Center) */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 2</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                <div className="space-y-3 flex-1">
                  {panel2.map(renderSpeciesTile)}
                </div>
              </div>

              {/* Panel 3 (Right) */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Panel 3</span>
                  <span className="text-[10px] text-slate-400">Featured Species</span>
                </div>
                <div className="space-y-3 flex-1">
                  {panel3.map(renderSpeciesTile)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Fold inward along dashed guidelines to form pocket brochure</span>
              <span>iNaturalist Citizen Science Data</span>
            </div>
          </div>
        )}

        {/* PAGE 2: OUTSIDE SPREAD (Left Flap, Center Back Cover, Right Front Cover) */}
        {(spreadMode === 'outside' || spreadMode === 'both') && (
          <div
            className="pdf-page bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 page-break-after flex flex-col justify-between"
            style={{ aspectRatio: '297 / 210', minHeight: '600px' }}
          >
            <div className="text-center pb-3 mb-4 border-b border-emerald-800/20 text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-between">
              <span>🌿 {taxonName || 'Species'} of {placeName || 'Region'}</span>
              <span className="text-[10px] text-slate-400 font-normal">Page 2 • Outside Cover Spread</span>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 relative flex-1">
              {/* Fold Guide Line 1 */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-2" />
              {/* Fold Guide Line 2 */}
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-dashed border-slate-300 pointer-events-none -ml-2" />

              {/* Left Column: Inside Flap Checklist */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-200">
                    Field Checklist
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 mb-2">
                    Check off species during your nature walk:
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {species.slice(0, 8).map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2 font-medium text-[11px]">
                          {idx + 1}. {s.commonName}
                        </span>
                        <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-600">
                  <div className="font-bold text-slate-800 mb-0.5">Observation Tip:</div>
                  Note time, weather, and specific habitat layer.
                </div>
              </div>

              {/* Center Column: Back Cover */}
              <div className="space-y-3 flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Citizen Science & iNaturalist</h4>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    This guide was compiled from research-grade observations. Every observation contributes to global biodiversity conservation.
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800 mb-1">Record Your Sightings:</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                      <li>Open the free iNaturalist app</li>
                      <li>Take a photo of any organism</li>
                      <li>Share with nature scientists</li>
                    </ol>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 border-t border-slate-200 pt-1.5">
                  All images licensed under Creative Commons. Respective author copyright credited on each photograph.
                </div>
              </div>

              {/* Right Column: FRONT COVER */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-xl flex flex-col justify-between shadow-md">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-300 mb-1">
                    Pocket Nature Guide
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold leading-tight">
                    {taxonName || 'Wildlife'}
                  </h2>
                  <div className="text-[11px] text-emerald-100 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{placeName || 'Regional Area'}</span>
                  </div>
                </div>

                {/* Hero Photo */}
                {heroPhoto && (
                  <div className="my-3 rounded-lg overflow-hidden border border-emerald-600/40 shadow-inner relative aspect-4/3">
                    <img
                      src={heroPhoto}
                      alt={heroSpecies.commonName || 'Hero species'}
                      crossOrigin="anonymous"
                      loading="eager"
                      onError={(e) => {
                        const hPhoto = heroSpecies.photo;
                        if (hPhoto?.squareUrl && e.currentTarget.src !== hPhoto.squareUrl) {
                          e.currentTarget.src = hPhoto.squareUrl;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    {/* Hero photo switcher */}
                    {onChangePhoto && heroSpecies.id && (
                      <button
                        type="button"
                        data-export-ignore="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangePhoto(heroSpecies.id, 1);
                        }}
                        disabled={loadingPhotoSpeciesId === heroSpecies.id}
                        className="no-print export-ignore absolute top-1.5 right-1.5 z-20 bg-black/75 hover:bg-black/95 active:scale-95 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20 transition-all cursor-pointer"
                        title="Click to switch cover photo of this species"
                      >
                        {loadingPhotoSpeciesId === heroSpecies.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>
                          {heroSpecies.photosList && heroSpecies.photosList.length > 1
                            ? `${(heroSpecies.photoIndex ?? 0) + 1}/${heroSpecies.photosList.length}`
                            : 'Cover Photo'}
                        </span>
                      </button>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-[8px] px-1.5 py-0.5 rounded text-white">
                      {heroSpecies.commonName}
                    </div>
                  </div>
                )}

                <div className="text-center pt-2 border-t border-emerald-700/60 text-[10px] text-emerald-200">
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
