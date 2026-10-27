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
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden flex flex-col ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs opacity-80 hover:opacity-100'
      }`}
    >
      {/* Top action bar: Selection checkbox & Photo switcher */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {onChangePhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangePhoto(species.id, 1);
            }}
            disabled={loadingPhotoSpeciesId === species.id}
            className="h-7 px-2 bg-black/75 hover:bg-black/95 active:scale-95 text-white text-[10px] font-bold rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20 transition-all cursor-pointer group/btn"
            title="Switch photo: Click to view alternative photos of this species with better visibility"
          >
            {loadingPhotoSpeciesId === species.id ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-3 h-3 text-emerald-400 transition-transform duration-300 group-hover/btn:rotate-180" />
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
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-md cursor-pointer ${
            isSelected
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
          title={isSelected ? 'Included in export' : 'Excluded from export'}
        >
          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Photo Container with Overlays */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
            <ImageIcon className="w-8 h-8 mb-1 stroke-1" />
            <span className="text-xs">No preview photo</span>
          </div>
        )}

        {/* TOP OVERLAY: Scientific Name and/or Common Name */}
        {(showCommonNameTop || showScientificNameTop) && (
          <div
            className={`absolute top-2.5 left-2.5 right-24 z-10 flex pointer-events-none ${
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
                  ? 'bg-black/65 backdrop-blur-md text-white border border-white/10 shadow-sm'
                  : badgeStyle === 'solid_black'
                  ? 'bg-black/90 text-white shadow-sm'
                  : badgeStyle === 'light'
                  ? 'bg-white/95 text-slate-900 shadow-sm'
                  : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
              }`}
            >
              {nameOrder === 'common_first' ? (
                <>
                  {showCommonNameTop && (
                    <div className="font-bold text-xs leading-tight truncate">
                      {species.commonName}
                    </div>
                  )}
                  {showScientificNameTop && (
                    <div
                      className={`text-[10px] italic leading-tight truncate ${
                        badgeStyle === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {species.scientificName}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {showScientificNameTop && (
                    <div className="font-bold text-xs italic leading-tight truncate">
                      {species.scientificName}
                    </div>
                  )}
                  {showCommonNameTop && (
                    <div
                      className={`text-[10px] leading-tight truncate ${
                        badgeStyle === 'light' ? 'text-slate-600' : 'text-slate-300'
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
                ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-left'
                : 'p-2 flex justify-start'
            }`}
          >
            <div
              className={`text-[10px] font-medium leading-tight truncate ${
                bottomStyle === 'dark_pill'
                  ? 'bg-black/70 backdrop-blur-xs text-slate-200 px-2 py-0.5 rounded-md border border-white/10 shadow-xs'
                  : 'text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
              }`}
              title={photo?.rawAttribution || attributionText}
            >
              {attributionText}
            </div>
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {species.iconicTaxon || species.rank}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {species.count?.toLocaleString()} obs
            </span>
          </div>

          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {species.commonName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
            {species.scientificName}
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <a
            href={`https://www.inaturalist.org/taxa/${species.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            title="View on iNaturalist"
          >
            <span>iNat #{species.id}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {species.wikipediaUrl && (
            <a
              href={species.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Read Wikipedia article"
            >
              Wikipedia
            </a>
          )}
        </div>
      </div>
    </div>
  );
}