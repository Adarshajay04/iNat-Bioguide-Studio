import React, { useState } from 'react';
import { ExternalLink, Check, Plus, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';

export default function SpeciesCard({
  species,
  isSelected,
  onToggleSelect,
  overlaySettings,
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  const photo = species.photo;
  const photoUrl = photo?.largeUrl || photo?.mediumUrl || photo?.squareUrl;

  // Build bottom attribution string
  const authorName = photo?.photographer || 'iNaturalist Contributor';
  const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
  const attributionText = `© ${authorName}${licenseTag}`;

  return (
    <div
      className={`group relative rounded-lg bg-white dark:bg-stone-900 border transition-colors duration-150 overflow-hidden flex flex-col ${
        isSelected
          ? 'border-emerald-700 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-700/30'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 opacity-90 hover:opacity-100 shadow-xs'
      }`}
    >
      {/* Top action bar: Selection checkbox & Photo switcher */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        {onChangePhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangePhoto(species.id, 1);
            }}
            disabled={loadingPhotoSpeciesId === species.id}
            className="h-6 px-1.5 bg-stone-900/80 hover:bg-stone-900 text-stone-200 text-[10px] font-mono rounded border border-white/20 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Alternative photo angle / specimen"
          >
            {loadingPhotoSpeciesId === species.id ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-2.5 h-2.5 text-stone-400 group-hover:text-white" />
            )}
            <span>
              {species.photosList && species.photosList.length > 1
                ? `${(species.photoIndex ?? 0) + 1}/${species.photosList.length}`
                : 'Photo'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleSelect(species.id)}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
            isSelected
              ? 'bg-emerald-800 text-white hover:bg-emerald-900 dark:bg-emerald-700'
              : 'bg-white/95 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 border border-stone-300 dark:border-stone-650'
          }`}
          title={isSelected ? 'Included in guide' : 'Excluded from guide'}
        >
          {isSelected ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Photo Container with Overlays */}
      <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-850 overflow-hidden">
        {!imgError && photoUrl ? (
          <img
            src={photoUrl}
            alt={species.commonName}
            crossOrigin="anonymous"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              if (photo?.mediumUrl && e.currentTarget.src !== photo.mediumUrl) {
                e.currentTarget.src = photo.mediumUrl;
              } else if (photo?.squareUrl && e.currentTarget.src !== photo.squareUrl) {
                e.currentTarget.src = photo.squareUrl;
              } else {
                setImgError(true);
              }
            }}
            className={`w-full h-full object-cover ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 p-4 text-center">
            <ImageIcon className="w-6 h-6 mb-1 stroke-1" />
            <span className="text-[11px]">No specimen photo</span>
          </div>
        )}

        {/* TOP OVERLAY: Scientific Name and/or Common Name */}
        {(showCommonNameTop || showScientificNameTop) && (
          <div
            className={`absolute top-2 left-2 right-20 z-10 flex pointer-events-none ${
              topPosition === 'top-center'
                ? 'justify-center'
                : topPosition === 'top-right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`px-2 py-0.5 rounded max-w-full truncate ${
                badgeStyle === 'frosted_dark'
                  ? 'bg-stone-900/80 backdrop-blur-xs text-white border border-white/10 shadow-xs'
                  : badgeStyle === 'solid_black'
                  ? 'bg-black/90 text-white shadow-xs'
                  : badgeStyle === 'light'
                  ? 'bg-white/95 text-stone-900 shadow-xs border border-stone-200'
                  : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'
              }`}
            >
              {nameOrder === 'common_first' ? (
                <>
                  {showCommonNameTop && (
                    <div className="font-semibold text-xs leading-tight truncate">
                      {species.commonName}
                    </div>
                  )}
                  {showScientificNameTop && (
                    <div
                      className={`text-[10px] italic leading-tight truncate font-serif ${
                        badgeStyle === 'light' ? 'text-stone-600' : 'text-stone-300'
                      }`}
                    >
                      {species.scientificName}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {showScientificNameTop && (
                    <div className="font-semibold text-xs italic leading-tight truncate font-serif">
                      {species.scientificName}
                    </div>
                  )}
                  {showCommonNameTop && (
                    <div
                      className={`text-[10px] leading-tight truncate ${
                        badgeStyle === 'light' ? 'text-stone-600' : 'text-stone-300'
                      }`}
                    >
                      {species.commonName}
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
            className={`absolute bottom-0 left-0 right-0 z-10 pointer-events-none ${
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
              title={photo?.rawAttribution || attributionText}
            >
              {attributionText}
            </div>
          </div>
        )}
      </div>

      {/* Specimen Plate Metadata */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
              {species.iconicTaxon || species.rank}
            </span>
            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
              {species.count?.toLocaleString()} obs
            </span>
          </div>

          <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs sm:text-sm leading-snug line-clamp-1">
            {species.commonName}
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 italic font-serif line-clamp-1">
            {species.scientificName}
          </p>
        </div>

        {/* Quiet Reference Metadata */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono">
          <a
            href={`https://www.inaturalist.org/taxa/${species.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            title="Inspect record on iNaturalist"
          >
            <span>#{species.id}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          {species.wikipediaUrl && (
            <a
              href={species.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 dark:hover:text-stone-300 font-sans text-[10px] transition-colors"
              title="Reference article"
            >
              Wiki
            </a>
          )}
        </div>
      </div>
    </div>
  );
}