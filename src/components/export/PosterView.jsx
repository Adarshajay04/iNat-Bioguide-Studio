import React, { useState } from 'react';
import { Compass, Sparkles, MapPin, Feather, Palette, Grid } from 'lucide-react';

export default function PosterView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'poster-export-container',
}) {
  const [posterTheme, setPosterTheme] = useState('botanical'); // 'botanical' | 'midnight' | 'forest'
  const [posterLimit, setPosterLimit] = useState(species.length > 48 ? '48' : 'all');

  const {
    showCommonNameTop,
    showScientificNameTop,
    nameOrder,
    badgeStyle,
    showAuthorCopyright,
    showLicenseCode,
    bottomStyle,
  } = overlaySettings;

  // Filter species for poster based on selected posterLimit
  const displayedSpecies =
    posterLimit === 'all' ? species : species.slice(0, Number(posterLimit));

  // Determine optimal responsive grid column density
  const getGridColsClass = () => {
    const count = displayedSpecies.length;
    if (count <= 18) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4';
    }
    if (count <= 48) {
      return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3';
    }
    if (count <= 100) {
      return 'grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2';
    }
    // High density mega atlas
    return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1.5';
  };

  // Theme styling definitions
  const themeStyles = {
    botanical: {
      wrapper: 'bg-[#faf8f2] text-[#2c3029] border-[#e2dcce]',
      headerBorder: 'border-[#7d8f69]',
      headerBadge: 'bg-[#ebe4d3] text-[#4d5b3c] border-[#d0c6af]',
      title: 'text-[#1d261a] font-serif',
      subtitle: 'text-[#556447]',
      card: 'bg-white border-[#e3dcd0]',
      footer: 'text-[#7d8a73] border-[#e2dcce]',
    },
    midnight: {
      wrapper: 'bg-slate-950 text-slate-100 border-slate-800',
      headerBorder: 'border-emerald-600',
      headerBadge: 'bg-slate-900 text-emerald-400 border-slate-700',
      title: 'text-white font-sans tracking-tight',
      subtitle: 'text-emerald-400',
      card: 'bg-slate-900 border-slate-800',
      footer: 'text-slate-500 border-slate-800',
    },
    forest: {
      wrapper: 'bg-[#0f2418] text-[#ecf6ee] border-[#1a3d29]',
      headerBorder: 'border-[#2d6a4f]',
      headerBadge: 'bg-[#1b3d2b] text-[#74c69d] border-[#2d6a4f]',
      title: 'text-white font-serif',
      subtitle: 'text-[#95d5b2]',
      card: 'bg-[#153121] border-[#1f4831]',
      footer: 'text-[#74c69d]/60 border-[#1f4831]',
    },
  };

  const currentTheme = themeStyles[posterTheme];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Theme & Poster Density Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 no-print">
        {/* Palette selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Poster Palette:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPosterTheme('botanical')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                posterTheme === 'botanical'
                  ? 'bg-[#4d5b3c] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📜</span>
              <span>Botanical</span>
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('forest')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                posterTheme === 'forest'
                  ? 'bg-[#1b3d2b] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🌲</span>
              <span>Forest</span>
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('midnight')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                posterTheme === 'midnight'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🌌</span>
              <span>Midnight</span>
            </button>
          </div>
        </div>

        {/* Poster Species Density Filter */}
        {species.length > 24 && (
          <div className="flex items-center gap-2 text-xs">
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-600">Density:</span>
            <select
              value={posterLimit}
              onChange={(e) => setPosterLimit(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="24">Top 24 (Spacious)</option>
              <option value="36">Top 36</option>
              <option value="48">Top 48 (Balanced)</option>
              {species.length > 48 && <option value="72">Top 72</option>}
              {species.length > 72 && <option value="100">Top 100</option>}
              <option value="all">All {species.length} Species (Mosaic)</option>
            </select>
          </div>
        )}
      </div>

      {/* POSTER CANVAS */}
      <div
        id={id}
        className={`${currentTheme.wrapper} p-6 sm:p-10 rounded-2xl shadow-2xl border-4 transition-colors duration-200 print:shadow-none print:p-6 print:border-none`}
      >
        {/* Poster Header Banner */}
        <div className={`text-center pb-8 mb-8 border-b-2 ${currentTheme.headerBorder}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Citizen Science Biodiversity Atlas</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl font-black uppercase tracking-wider ${currentTheme.title}`}>
            {taxonName || 'Fauna & Flora'} of {placeName || 'Earth'}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm mt-3 flex-wrap">
            <span className={`font-semibold ${currentTheme.subtitle}`}>
              {displayedSpecies.length} Featured Species
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 opacity-80">
              <MapPin className="w-3.5 h-3.5" />
              {placeName || 'Region'}
            </span>
            <span>•</span>
            <span className="opacity-80">iNaturalist Verified Observations</span>
          </div>
        </div>

        {/* Poster Mosaic Grid */}
        <div className={`grid ${getGridColsClass()}`}>
          {displayedSpecies.map((s, index) => {
            const photo = s.photo;
            const photoUrl = photo?.largeUrl || photo?.mediumUrl || photo?.squareUrl;
            const authorName = photo?.photographer || 'Contributor';
            const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
            const attributionText = `© ${authorName}${licenseTag}`;

            return (
              <div
                key={s.id}
                className={`${currentTheme.card} border rounded-lg overflow-hidden flex flex-col justify-between shadow-xs transition-transform duration-200 hover:scale-[1.02]`}
              >
                {/* Photo with Overlays */}
                <div className="relative aspect-square w-full bg-black/10 overflow-hidden">
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

                  {/* Number Badge */}
                  <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-xs text-[8px] font-mono font-bold text-white px-1 py-0.2 rounded">
                    #{String(index + 1).padStart(2, '0')}
                  </div>

                  {/* TOP OVERLAY: Common / Scientific Name */}
                  {(showCommonNameTop || showScientificNameTop) && (
                    <div className="absolute top-1 left-1 right-6 flex justify-start pointer-events-none">
                      <div
                        className={`px-1 py-0.5 rounded max-w-full truncate ${
                          badgeStyle === 'frosted_dark'
                            ? 'bg-black/70 backdrop-blur-xs text-white'
                            : badgeStyle === 'solid_black'
                            ? 'bg-black/95 text-white'
                            : badgeStyle === 'light'
                            ? 'bg-white/95 text-slate-900'
                            : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                        }`}
                      >
                        {nameOrder === 'common_first' ? (
                          <>
                            {showCommonNameTop && (
                              <div className="font-bold text-[9px] leading-tight truncate">
                                {s.commonName}
                              </div>
                            )}
                            {showScientificNameTop && (
                              <div className="text-[7.5px] italic leading-tight truncate opacity-85">
                                {s.scientificName}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {showScientificNameTop && (
                              <div className="font-bold text-[9px] italic leading-tight truncate">
                                {s.scientificName}
                              </div>
                            )}
                            {showCommonNameTop && (
                              <div className="text-[7.5px] leading-tight truncate opacity-85">
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
                          ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-0.5'
                          : 'p-0.5 flex justify-start'
                      }`}
                    >
                      <div
                        className={`text-[7px] font-medium leading-tight truncate ${
                          bottomStyle === 'dark_pill'
                            ? 'bg-black/75 text-slate-200 px-1 py-0.2 rounded'
                            : 'text-slate-100 drop-shadow-sm'
                        }`}
                        title={attributionText}
                      >
                        {attributionText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitle Label on Poster Tile */}
                <div className="p-1 sm:p-1.5">
                  <div className="font-bold text-[10px] leading-tight truncate">
                    {s.commonName}
                  </div>
                  <div className="text-[8px] italic opacity-75 font-serif truncate">
                    {s.scientificName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Poster Bottom Credits Footer */}
        <div className={`mt-8 pt-6 border-t ${currentTheme.footer} text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left`}>
          <div>
            <span className="font-bold">BioGuide Studio Nature Atlas</span> • Curated from public research-grade records via the iNaturalist API.
          </div>
          <div>
            All images © their respective photographers under Creative Commons licenses.
          </div>
        </div>
      </div>
    </div>
  );
}
