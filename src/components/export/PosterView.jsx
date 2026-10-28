import React, { useState } from 'react';
import { Palette, Grid, RefreshCw, Loader2 } from 'lucide-react';

export default function PosterView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'poster-export-container',
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
  const [posterTheme, setPosterTheme] = useState('botanical'); // 'botanical' | 'forest' | 'midnight'
  const [posterLimit, setPosterLimit] = useState(species.length > 48 ? '48' : 'all');

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

  // Filter species for poster based on selected posterLimit
  const displayedSpecies =
    posterLimit === 'all' ? species : species.slice(0, Number(posterLimit));

  // Determine optimal responsive grid column density
  const getGridColsClass = () => {
    const count = displayedSpecies.length;
    if (count <= 18) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
    }
    if (count <= 48) {
      return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5';
    }
    if (count <= 100) {
      return 'grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2';
    }
    // High density mega atlas
    return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1.5';
  };

  // Authentic Natural History Chart Theme styling
  const themeStyles = {
    botanical: {
      wrapper: 'bg-[#f7f4ec] text-[#2c3029] border-[#2c3029]',
      innerBorder: 'border-[#c8c0ae]',
      headerBorder: 'border-[#2c3029]',
      cartouche: 'bg-[#ece5d4] border-[#b8ae98] text-[#2c3029]',
      title: 'text-[#1c221a] font-serif',
      subtitle: 'text-[#4e5b47]',
      card: 'bg-white border-[#dfd7c7]',
      captionBg: 'bg-[#f7f4ec] border-t border-[#dfd7c7]',
      footer: 'text-[#6b7565] border-[#c8c0ae]',
    },
    forest: {
      wrapper: 'bg-[#0f2418] text-[#ecf6ee] border-[#2d6a4f]',
      innerBorder: 'border-[#1b3d2b]',
      headerBorder: 'border-[#2d6a4f]',
      cartouche: 'bg-[#153422] border-[#255439] text-[#74c69d]',
      title: 'text-white font-serif',
      subtitle: 'text-[#95d5b2]',
      card: 'bg-[#132c1e] border-[#1f4831]',
      captionBg: 'bg-[#0f2418] border-t border-[#1f4831]',
      footer: 'text-[#74c69d]/70 border-[#1f4831]',
    },
    midnight: {
      wrapper: 'bg-[#0d0f12] text-stone-100 border-stone-700',
      innerBorder: 'border-stone-800',
      headerBorder: 'border-stone-700',
      cartouche: 'bg-stone-900 border-stone-800 text-stone-300',
      title: 'text-stone-50 font-serif',
      subtitle: 'text-stone-400',
      card: 'bg-stone-900 border-stone-800',
      captionBg: 'bg-stone-950 border-t border-stone-800',
      footer: 'text-stone-500 border-stone-800',
    },
  };

  const currentTheme = themeStyles[posterTheme];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Theme & Poster Density Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs no-print transition-colors duration-200">
        {/* Palette selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Palette className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Chart Palette:
          </span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setPosterTheme('botanical')}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                posterTheme === 'botanical'
                  ? 'bg-[#2c3029] text-[#faf8f2] border-[#2c3029] font-medium'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f7f4ec] border border-[#2c3029]/40" />
              <span>Botanical Archival</span>
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('forest')}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                posterTheme === 'forest'
                  ? 'bg-[#1b3d2b] text-white border-[#1b3d2b] font-medium'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f2418] border border-[#2d6a4f]" />
              <span>Spruce Forest</span>
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('midnight')}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                posterTheme === 'midnight'
                  ? 'bg-stone-900 text-white border-stone-900 font-medium'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-stone-600" />
              <span>Nocturnal Slate</span>
            </button>
          </div>
        </div>

        {/* Poster Species Density Filter */}
        {species.length > 24 && (
          <div className="flex items-center gap-2 text-xs">
            <Grid className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span className="font-medium text-stone-600 dark:text-stone-400">Density:</span>
            <select
              value={posterLimit}
              onChange={(e) => setPosterLimit(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="24">Top 24 (Spacious)</option>
              <option value="36">Top 36 (Balanced)</option>
              <option value="48">Top 48 (Standard Atlas)</option>
              {species.length > 48 && (
                <option value="100">Top 100 (Dense Wall Chart)</option>
              )}
              {species.length > 100 && (
                <option value="all">All {species.length} Species (Full Master Chart)</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* POSTER CANVAS — Authentic Natural History Wall Chart */}
      <div
        id={id}
        className={`pdf-page ${currentTheme.wrapper} p-6 sm:p-10 border-[3px] transition-colors duration-150 print:p-6 print:border-none`}
      >
        {/* Inner Archival Hairline Border Frame */}
        <div className={`border ${currentTheme.innerBorder} p-4 sm:p-6`}>
          {/* Formal Museum Header Cartouche */}
          <div className={`text-center pb-6 mb-6 border-b-2 ${currentTheme.headerBorder}`}>
            <div className="font-mono text-[9px] uppercase tracking-widest opacity-80 mb-1">
              Systematic Biodiversity Chart • Tabula I
            </div>

            <h1 className={`text-2xl sm:text-4xl font-bold uppercase tracking-wider ${currentTheme.title}`}>
              {taxonName || 'Fauna & Flora'} of {placeName || 'Region'}
            </h1>

            <div className="flex items-center justify-center gap-3 text-[11px] font-mono mt-2 flex-wrap opacity-85">
              <span className="font-semibold">
                {displayedSpecies.length} Cataloged Species
              </span>
              <span>•</span>
              <span>{placeName || 'Locality'}</span>
              <span>•</span>
              <span>Research-Grade Specimens via iNaturalist</span>
            </div>
          </div>

          {/* Poster Mosaic Grid */}
          <div className={`grid ${getGridColsClass()}`}>
            {displayedSpecies.map((s, index) => {
              const photo = s.photo;
              const photoUrl = photo?.mediumUrl || photo?.largeUrl || photo?.squareUrl;
              const authorName = photo?.photographer || 'Contributor';
              const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
              const attributionText = `© ${authorName}${licenseTag}`;

              return (
                <div
                  key={s.id}
                  className={`${currentTheme.card} border rounded-2xs overflow-hidden flex flex-col justify-between shadow-2xs relative group`}
                >
                  {/* Photo with Overlays */}
                  <div className="relative aspect-square w-full bg-stone-200 overflow-hidden">
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

                    {/* Figure Number Plaque */}
                    <div className="absolute top-1 left-1 bg-black/75 text-[7.5px] font-mono text-stone-200 px-1 py-0.2 rounded-2xs border border-white/10">
                      Fig. {index + 1}
                    </div>

                    {/* Photo Switcher Button (interactive in preview, hidden in print/PDF) */}
                    {onChangePhoto && (
                      <button
                        type="button"
                        data-export-ignore="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangePhoto(s.id, 1);
                        }}
                        disabled={loadingPhotoSpeciesId === s.id}
                        className="no-print export-ignore absolute bottom-1 right-1 z-20 bg-stone-900/85 hover:bg-black text-white text-[7px] font-mono px-1 py-0.2 rounded-2xs border border-white/20 transition-all cursor-pointer"
                        title="Switch specimen photo"
                      >
                        {loadingPhotoSpeciesId === s.id ? (
                          <Loader2 className="w-2 h-2 animate-spin text-emerald-400" />
                        ) : (
                          <RefreshCw className="w-2 h-2 text-stone-300" />
                        )}
                        <span>Alt</span>
                      </button>
                    )}

                    {/* Attribution Overlay */}
                    {showAuthorCopyright && (
                      <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 px-1 py-0.2 pointer-events-none">
                        <div className="text-[5.5px] font-mono text-stone-300 truncate leading-none">
                          {attributionText}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Classical Museum Plate Caption */}
                  <div className={`p-1 leading-tight text-center ${currentTheme.captionBg}`}>
                    <div className="font-serif italic text-[8px] font-medium leading-tight truncate">
                      {s.scientificName}
                    </div>
                    <div className="text-[7.5px] font-sans font-medium opacity-85 leading-tight truncate mt-0.2">
                      {s.commonName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Archival Colophon Footer */}
          <div className={`mt-6 pt-3 border-t text-[8px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 opacity-80 ${currentTheme.footer}`}>
            <div>
              BioGuide Studio • Research-Grade Biodata via iNaturalist & GBIF
            </div>
            <div>
              Published for Scientific, Educational & Field Natural History Reference
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
