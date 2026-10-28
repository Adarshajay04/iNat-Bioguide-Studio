import React from 'react';
import { Calendar, MapPin, RefreshCw, Loader2 } from 'lucide-react';

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
        className="avoid-break border border-stone-200 rounded-xs overflow-hidden bg-white flex flex-col justify-between shadow-2xs"
      >
        {/* Photo with Overlays */}
        <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
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
              className="no-print export-ignore absolute top-1.5 right-1.5 z-20 bg-stone-900/85 hover:bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded-2xs flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
              title="Switch photo for better feature visibility"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-2.5 h-2.5 text-stone-300" />
              )}
              <span>
                {s.photosList && s.photosList.length > 1
                  ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}`
                  : 'Alt Photo'}
              </span>
            </button>
          )}

          {/* TOP OVERLAY: Common / Scientific Name */}
          {(showCommonNameTop || showScientificNameTop) && (
            <div
              className={`absolute top-1.5 left-1.5 right-16 flex pointer-events-none ${
                topPosition === 'top-center'
                  ? 'justify-center'
                  : topPosition === 'top-right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`px-2 py-0.5 rounded-2xs max-w-full truncate ${
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
                      <div className="font-semibold text-xs leading-tight truncate">
                        {s.commonName}
                      </div>
                    )}
                    {showScientificNameTop && (
                      <div className="text-[10px] italic font-serif leading-tight truncate text-stone-300">
                        {s.scientificName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showScientificNameTop && (
                      <div className="font-semibold text-xs italic font-serif leading-tight truncate">
                        {s.scientificName}
                      </div>
                    )}
                    {showCommonNameTop && (
                      <div className="text-[10px] leading-tight truncate text-stone-300">
                        {s.commonName}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM OVERLAY: Attribution */}
          {showAuthorCopyright && (
            <div
              className={`absolute bottom-0 left-0 right-0 z-10 pointer-events-none ${
                bottomStyle === 'dark_banner'
                  ? 'bg-stone-900/80 p-1'
                  : 'p-1 flex justify-start'
              }`}
            >
              <div
                className={`text-[8.5px] font-mono leading-tight truncate ${
                  bottomStyle === 'dark_pill'
                    ? 'bg-stone-900/85 text-stone-200 px-1.5 py-0.5 rounded-2xs border border-white/10'
                    : 'text-stone-100 drop-shadow-xs'
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
                <h3 className="font-semibold text-sm text-stone-900 leading-snug truncate">
                  {globalIndex}. {s.commonName}
                </h3>
                <p className="text-xs italic text-stone-600 font-serif truncate">
                  {s.scientificName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9.5px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-2xs border border-stone-200">
                  {s.count?.toLocaleString()} obs
                </span>
              </div>
            </div>
          </div>

          {/* Field Notes & Checkbox */}
          <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-stone-400 rounded-2xs bg-stone-50/50" />
              <span className="font-medium text-[11px] text-stone-700">Observed</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
              <span>Date: _____</span>
              <span>Loc: _____</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="max-w-4xl mx-auto space-y-6 print:space-y-0">
      {pages.map((pageItems, pageIdx) => (
        <div
          key={pageIdx}
          className="pdf-page bg-white text-stone-900 p-6 sm:p-8 rounded-none shadow-xs border border-stone-300 page-break-after flex flex-col justify-between"
          style={{ aspectRatio: '210 / 297', minHeight: '840px' }}
        >
          {/* Authentic Book Plate Header */}
          <div className="border-b-2 border-stone-800 pb-3 mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-[9.5px] font-mono uppercase tracking-widest text-stone-500 mb-0.5">
                Plate {pageIdx + 1} • Field Guide & Reference Checklist
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
                {taxonName || 'Taxa'} of {placeName || 'Region'}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap font-mono">
                <span className="flex items-center gap-1 text-stone-700">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  {placeName || 'Location'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {currentDate}
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-stone-500">
              <span className="font-bold text-stone-800">
                Plate {pageIdx + 1} of {pages.length}
              </span>
            </div>
          </div>

          {/* 2x2 Grid of 4 Species Cards: Fits cleanly on an A4 portrait sheet */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 flex-1">
            {pageItems.map((s, index) =>
              renderCard(s, pageIdx * ITEMS_PER_PAGE + index + 1)
            )}
          </div>

          {/* Authentic Page Footer */}
          <div className="mt-5 pt-3 border-t border-stone-200 text-[10px] font-mono text-stone-400 flex items-center justify-between">
            <span>BioGuide Studio • Research-grade biodiversity data via iNaturalist</span>
            <span>
              Plate {pageIdx + 1} of {pages.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
