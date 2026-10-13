import React from 'react';
import { Compass, Calendar, MapPin, Feather, CheckSquare, Eye, RefreshCw, Loader2 } from 'lucide-react';

export default function FieldGuideView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'field-guide-export-container',
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
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

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Chunk species into 4 cards per page (2x2 grid) so NO CARDS are ever cut in half
  const ITEMS_PER_PAGE = 4;
  const pages = [];
  for (let i = 0; i < species.length; i += ITEMS_PER_PAGE) {
    pages.push(species.slice(i, i + ITEMS_PER_PAGE));
  }

  const renderCard = (s, globalIndex) => {
    const photo = s.photo;
    const photoUrl = photo?.mediumUrl || photo?.largeUrl || photo?.squareUrl;
    const authorName = photo?.photographer || 'Contributor';
    const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
    const attributionText = `© ${authorName}${licenseTag}`;

    return (
      <div
        key={s.id}
        className="avoid-break border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between shadow-xs"
      >
        {/* Photo with Overlays */}
        <div className="relative aspect-16/10 w-full bg-slate-200 overflow-hidden">
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
              onClick={(e) => {
                e.stopPropagation();
                onChangePhoto(s.id, 1);
              }}
              disabled={loadingPhotoSpeciesId === s.id}
              className="no-print absolute top-2 right-2 z-20 bg-black/75 hover:bg-black/95 active:scale-95 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20 transition-all cursor-pointer group/btn"
              title="Click to switch photo if the bird's face or body is hidden behind the name badge"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-3 h-3 text-emerald-400 transition-transform duration-300 group-hover/btn:rotate-180" />
              )}
              <span>
                {s.photosList && s.photosList.length > 1
                  ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}`
                  : 'Change Photo'}
              </span>
            </button>
          )}

          {/* TOP OVERLAY: Common / Scientific Name */}
          {(showCommonNameTop || showScientificNameTop) && (
            <div
              className={`absolute top-2 left-2 right-16 flex pointer-events-none ${
                topPosition === 'top-center'
                  ? 'justify-center'
                  : topPosition === 'top-right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`px-2 py-1 rounded-md max-w-full truncate ${
                  badgeStyle === 'frosted_dark'
                    ? 'bg-black/65 backdrop-blur-xs text-white border border-white/10'
                    : badgeStyle === 'solid_black'
                    ? 'bg-black/90 text-white'
                    : badgeStyle === 'light'
                    ? 'bg-white/95 text-slate-900'
                    : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                }`}
              >
                {nameOrder === 'common_first' ? (
                  <>
                    {showCommonNameTop && (
                      <div className="font-bold text-xs leading-tight truncate">
                        {s.commonName}
                      </div>
                    )}
                    {showScientificNameTop && (
                      <div className="text-[10px] italic leading-tight truncate opacity-90">
                        {s.scientificName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showScientificNameTop && (
                      <div className="font-bold text-xs italic leading-tight truncate">
                        {s.scientificName}
                      </div>
                    )}
                    {showCommonNameTop && (
                      <div className="text-[10px] leading-tight truncate opacity-90">
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
                  ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5'
                  : 'p-1.5 flex justify-start'
              }`}
            >
              <div
                className={`text-[9px] font-medium leading-tight truncate ${
                  bottomStyle === 'dark_pill'
                    ? 'bg-black/70 text-slate-200 px-1.5 py-0.5 rounded border border-white/10'
                    : 'text-slate-100 drop-shadow-sm'
                }`}
              >
                {attributionText}
              </div>
            </div>
          )}
        </div>

        {/* Guide Card Field Info & Observation Tick-box */}
        <div className="p-3 bg-white flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="truncate">
                <h3 className="font-bold text-sm text-slate-900 leading-snug truncate">
                  {globalIndex}. {s.commonName}
                </h3>
                <p className="text-xs italic text-slate-500 font-serif truncate">
                  {s.scientificName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {s.count?.toLocaleString()} records
                </span>
              </div>
            </div>
          </div>

          {/* Field Notes & Checkbox */}
          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-xs" />
              <span className="font-medium text-slate-700 text-[11px]">Observed</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Date: _____</span>
              <span>Loc: _____</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="max-w-4xl mx-auto space-y-8 print:space-y-0">
      {pages.map((pageItems, pageIdx) => (
        <div
          key={pageIdx}
          className="pdf-page bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 page-break-after flex flex-col justify-between"
          style={{ aspectRatio: '210 / 297', minHeight: '840px' }}
        >
          {/* Page Header */}
          <div className="border-b-2 border-emerald-700 pb-4 mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-[11px] font-bold uppercase tracking-widest mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Field Guide & Checklist</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {taxonName || 'Taxa'} of {placeName || 'Region'}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {placeName || 'Location'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {currentDate}
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              <span className="font-bold text-emerald-800">
                Page {pageIdx + 1} of {pages.length}
              </span>
            </div>
          </div>

          {/* 2x2 Grid of 4 Species Cards: Fits cleanly on an A4 portrait sheet */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 flex-1">
            {pageItems.map((s, index) =>
              renderCard(s, pageIdx * ITEMS_PER_PAGE + index + 1)
            )}
          </div>

          {/* Page Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <span>BioGuide Studio • Sourced from iNaturalist verified records</span>
            <span className="font-mono">
              Page {pageIdx + 1} of {pages.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
