import React from 'react';
import { Compass, Calendar, MapPin, Feather, CheckSquare, Eye } from 'lucide-react';

export default function FieldGuideView({
  species,
  placeName,
  taxonName,
  overlaySettings,
  id = 'field-guide-export-container',
}) {
  const {
    showCommonNameTop,
    showScientificNameTop,
    nameOrder,
    badgeStyle,
    showAuthorCopyright,
    showLicenseCode,
    bottomStyle,
  } = overlaySettings;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div id={id} className="bg-white text-slate-900 max-w-5xl mx-auto p-6 sm:p-10 shadow-lg rounded-2xl print:shadow-none print:p-4 print:max-w-none">
      {/* Field Guide Document Header */}
      <div className="border-b-2 border-emerald-700 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Field Guide & Nature Checklist</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {taxonName || 'Taxa'} of {placeName || 'Region'}
          </h1>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {placeName || 'Location'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Feather className="w-3.5 h-3.5 text-emerald-600" />
              {species.length} Species Cataloged
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentDate}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="font-semibold text-emerald-800">iNaturalist Research Data</div>
          <div>Verified Citizen Science</div>
        </div>
      </div>

      {/* Species Grid - Formatted for Multi-Page PDF & Printing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {species.map((s, index) => {
          const photo = s.photo;
          const photoUrl = photo?.largeUrl || photo?.mediumUrl || photo?.squareUrl;
          const authorName = photo?.photographer || 'Contributor';
          const licenseTag = showLicenseCode && photo?.licenseCode ? ` (${photo.licenseCode.toUpperCase()})` : '';
          const attributionText = `© ${authorName}${licenseTag}`;

          return (
            <div
              key={s.id}
              className="avoid-break border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between"
            >
              {/* Photo with Overlays */}
              <div className="relative aspect-16/10 w-full bg-slate-200 overflow-hidden">
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
                  <div className="absolute top-2 left-2 right-2 flex justify-start pointer-events-none">
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
              <div className="p-3.5 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {index + 1}. {s.commonName}
                      </h3>
                      <p className="text-xs italic text-slate-500 font-serif">
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
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 rounded-sm" />
                    <span className="font-medium text-slate-700">Observed</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Date: __________</span>
                    <span>Loc: __________</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Guide Document Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          Generated using BioGuide Studio • Data and media licensed under Creative Commons via iNaturalist.
        </p>
        <p className="font-mono text-[11px]">Page 1 • Field Guide Export</p>
      </div>
    </div>
  );
}
