import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Feather,
  RefreshCw,
  Loader2,
  Sparkles,
  Columns,
  Layers,
  CheckSquare,
  BookOpen,
  Info,
  Grid,
  List,
} from 'lucide-react';

export default function PocketGuideView({
  species = [],
  placeName = '',
  taxonName = '',
  overlaySettings = {},
  id = 'pocket-guide-export-container',
  onChangePhoto,
  loadingPhotoSpeciesId,
  onFetchCommonSpecies,
}) {
  // Format / spread view: 'spread' (2 × 6-panel 21"x8.5" panoramic sheets) | 'sheets' (4 × 3-panel US Letter/A4) | 'panels' (12 × 3.5"x8.5" pages)
  const [viewFormat, setViewFormat] = useState('spread');
  // Target species count: 140 (14/panel × 10 panels + 2 covers) | 154 (14/panel × 11 panels) | 132 (12/panel) | 160 (max)
  const [targetSpeciesCount, setTargetSpeciesCount] = useState(140);
  // Card layout: 'grid' (2 columns × 7 rows per panel) | 'compact' (sleek horizontal rows)
  const [cardLayout, setCardLayout] = useState('grid');
  // Color theme: 'naturalist' (Waterford Press ivory & forest) | 'classic' (pure white & emerald) | 'midnight' (deep slate)
  const [theme, setTheme] = useState('naturalist');
  const [isFetchingCommon, setIsFetchingCommon] = useState(false);

  const {
    showCommonNameTop = true,
    showScientificNameTop = true,
    nameOrder = 'common_first',
    showAuthorCopyright = true,
    showLicenseCode = true,
  } = overlaySettings;

  // Species slicing & sorting
  // iNaturalist results are pre-sorted by observation count descending, ensuring top common species
  const commonSpecies = species.slice(0, targetSpeciesCount);
  const heroSpecies = species[0] || {};
  const heroPhoto = heroSpecies.photo?.largeUrl || heroSpecies.photo?.mediumUrl || heroSpecies.photo?.squareUrl;

  // Handler for 1-click loading of 150 top common species
  const handleLoadCommon = async () => {
    if (!onFetchCommonSpecies) return;
    try {
      setIsFetchingCommon(true);
      await onFetchCommonSpecies(150);
    } finally {
      setIsFetchingCommon(false);
    }
  };

  // Determine species per panel based on target count
  // In 140 mode: Panels 2..11 have 14 species each = 140 species. Panel 1 is Cover, Panel 12 is Field Notes/Checklist.
  // In 154 mode: Panels 2..12 have 14 species each = 154 species. Panel 1 is Cover.
  // In 132 mode: Panels 2..12 have 12 species each = 132 species.
  // In 160 mode: Panels 2..12 have ~14-15 species each = 160 species.
  const hasBackCoverOnly = targetSpeciesCount <= 140;
  const numSpeciesPanels = hasBackCoverOnly ? 10 : 11;
  const speciesPerPanel = Math.ceil(commonSpecies.length / (numSpeciesPanels || 1)) || 14;

  // Distribute species into the 12 panels
  // Panel 1: Front Cover
  // Panels 2..11: Species
  // Panel 12: Back Cover or Species Panel 11 + compact summary
  const panelsData = [];

  // Panel 1: Front Cover
  panelsData.push({
    panelNumber: 1,
    title: 'Front Cover',
    isCover: true,
    species: [],
  });

  // Panels 2 to 11
  for (let i = 0; i < 10; i++) {
    const startIdx = i * speciesPerPanel;
    const endIdx = startIdx + speciesPerPanel;
    panelsData.push({
      panelNumber: i + 2,
      title: `Species #${startIdx + 1}–#${Math.min(endIdx, commonSpecies.length)}`,
      isCover: false,
      species: commonSpecies.slice(startIdx, endIdx),
      startRank: startIdx + 1,
    });
  }

  // Panel 12: Back Cover or Species Panel 11
  if (hasBackCoverOnly) {
    panelsData.push({
      panelNumber: 12,
      title: 'Field Checklist & Notes',
      isBackCover: true,
      species: [],
    });
  } else {
    const startIdx = 10 * speciesPerPanel;
    const endIdx = Math.min(startIdx + speciesPerPanel, commonSpecies.length);
    panelsData.push({
      panelNumber: 12,
      title: `Species #${startIdx + 1}–#${endIdx}`,
      isBackCover: false,
      species: commonSpecies.slice(startIdx, endIdx),
      startRank: startIdx + 1,
      hasFooterSummary: true,
    });
  }

  // Theme styling definitions
  const themeStyles = {
    naturalist: {
      bg: 'bg-[#faf8f2]',
      border: 'border-[#dfd8c8]',
      cardBg: 'bg-white/95',
      headerBg: 'bg-gradient-to-r from-[#1c3829] to-[#2d553e] text-[#f4ecd8]',
      accentText: 'text-[#1c3829]',
      badgeBg: 'bg-[#2d553e]',
      coverGradient: 'from-[#1a3826] via-[#224831] to-[#2c5c3e]',
      coverAccent: 'text-[#e5ca80]',
      foldLine: 'border-[#c8bea9]',
    },
    classic: {
      bg: 'bg-white',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50/80',
      headerBg: 'bg-emerald-800 text-white',
      accentText: 'text-emerald-800',
      badgeBg: 'bg-emerald-700',
      coverGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
      coverAccent: 'text-emerald-300',
      foldLine: 'border-slate-300',
    },
    midnight: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      cardBg: 'bg-slate-800/90 text-white',
      headerBg: 'bg-black/60 text-emerald-400',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-600',
      coverGradient: 'from-slate-950 via-slate-900 to-emerald-950',
      coverAccent: 'text-emerald-400',
      foldLine: 'border-slate-700',
    },
  }[theme];

  // Helper to render individual species card
  const renderSpeciesCard = (s, rank) => {
    if (!s) return null;
    const photo = s.photo;
    const photoUrl = photo?.mediumUrl || photo?.largeUrl || photo?.squareUrl;
    const photographer = photo?.photographer || 'Contributor';
    const licenseTag = showLicenseCode && photo?.licenseCode ? ` • ${photo.licenseCode.toUpperCase()}` : '';

    if (cardLayout === 'compact') {
      return (
        <div
          key={s.id}
          className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-md p-1 flex items-center gap-1.5 shadow-2xs relative group`}
        >
          {/* Thumbnail */}
          <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden bg-slate-200">
            {photoUrl ? (
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
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">🌿</div>
            )}

            {/* Photo switcher (hidden in print/export) */}
            {onChangePhoto && (
              <button
                type="button"
                data-export-ignore="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangePhoto(s.id, 1);
                }}
                disabled={loadingPhotoSpeciesId === s.id}
                className="no-print export-ignore absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Switch photo for better bird visibility"
              >
                {loadingPhotoSpeciesId === s.id ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
                ) : (
                  <RefreshCw className="w-2.5 h-2.5 text-white" />
                )}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-1 leading-none">
            <div className="flex items-center gap-1">
              <span className="text-[7.5px] font-mono font-bold text-slate-400 shrink-0">#{rank}</span>
              <span className={`text-[8.5px] font-bold truncate ${theme === 'midnight' ? 'text-white' : 'text-slate-900'}`}>
                {nameOrder === 'scientific_first' ? s.scientificName : s.commonName}
              </span>
            </div>
            <div className="text-[7px] italic text-slate-500 truncate mt-0.5">
              {nameOrder === 'scientific_first' ? s.commonName : s.scientificName}
            </div>
          </div>

          {/* Sighting Checkbox */}
          <div className="w-3 h-3 rounded-xs border border-slate-300 shrink-0 flex items-center justify-center bg-white/80" />
        </div>
      );
    }

    // Default: 'grid' layout (2 columns)
    return (
      <div
        key={s.id}
        className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-sm overflow-hidden flex flex-col justify-between shadow-2xs relative group min-h-0 h-full`}
      >
        {/* Photo Container - Uses flex-1 min-h-0 so photo expands to fill available cell height without overflowing */}
        <div className="flex-1 min-h-0 relative bg-slate-100 overflow-hidden">
          {photoUrl ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">🌿</div>
          )}

          {/* Sighting tick-box */}
          <div
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-2xs bg-white/90 border border-black/30 flex items-center justify-center shadow-xs"
            title="Tick when spotted in the field"
          />

          {/* Photo Switcher Button (hidden in PDF & print) */}
          {onChangePhoto && (
            <button
              type="button"
              data-export-ignore="true"
              onClick={(e) => {
                e.stopPropagation();
                onChangePhoto(s.id, 1);
              }}
              disabled={loadingPhotoSpeciesId === s.id}
              className="no-print export-ignore absolute bottom-0.5 right-0.5 z-20 bg-black/80 hover:bg-black/95 active:scale-95 text-white text-[6px] font-bold px-1 py-0.2 rounded backdrop-blur-md flex items-center gap-0.5 shadow-md border border-white/20 transition-all cursor-pointer opacity-90 hover:opacity-100"
              title="Switch photo if bird face/features are obscured"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-2 h-2 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-2 h-2 text-emerald-400" />
              )}
              <span>{s.photosList && s.photosList.length > 1 ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}` : 'Photo'}</span>
            </button>
          )}

          {/* Mini Copyright overlay if requested */}
          {showAuthorCopyright && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5 pointer-events-none">
              <div className="text-[5.5px] text-slate-200 truncate leading-none">
                © {photographer}{licenseTag}
              </div>
            </div>
          )}
        </div>

        {/* Labels & Information (compact names, observation counts and family removed) */}
        <div className="px-1 py-0.5 shrink-0 leading-tight">
          {nameOrder === 'common_first' ? (
            <>
              {showCommonNameTop && (
                <div className={`font-bold text-[8px] leading-tight truncate ${theme === 'midnight' ? 'text-white' : 'text-slate-900'}`}>
                  {s.commonName}
                </div>
              )}
              {showScientificNameTop && (
                <div className="text-[6.5px] italic text-slate-500 leading-tight truncate">
                  {s.scientificName}
                </div>
              )}
            </>
          ) : (
            <>
              {showScientificNameTop && (
                <div className={`font-bold italic text-[8px] leading-tight truncate ${theme === 'midnight' ? 'text-white' : 'text-slate-900'}`}>
                  {s.scientificName}
                </div>
              )}
              {showCommonNameTop && (
                <div className="text-[6.5px] text-slate-500 leading-tight truncate">
                  {s.commonName}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Front Cover (Panel 1)
  const renderFrontCover = () => (
    <div
      key="panel-1-cover"
      className={`h-full flex flex-col justify-between bg-gradient-to-b ${themeStyles.coverGradient} text-white p-3.5 rounded-none relative overflow-hidden select-none`}
    >
      {/* Decorative Naturalist Emblem */}
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      {/* Top Header Block */}
      <div>
        <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-2">
          <span className={`text-[8px] font-black uppercase tracking-widest ${themeStyles.coverAccent}`}>
            Pocket Naturalist Guide
          </span>
          <span className="text-[7.5px] font-mono text-white/70">
            12-PANEL FIELD EDITION
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-white drop-shadow-md">
          {taxonName || 'Wildlife'}
        </h1>

        <div className="flex items-center gap-1 text-[10.5px] font-medium text-emerald-200 mt-1">
          <MapPin className="w-3 h-3 shrink-0 text-emerald-300" />
          <span className="truncate">{placeName || 'Regional Area'}</span>
        </div>

        <div className="text-[8px] text-white/80 mt-1 leading-tight">
          A Folding Pocket Guide to {commonSpecies.length || 150} Most Common & Characteristic Species
        </div>
      </div>

      {/* Hero Featured Photograph */}
      <div className="my-2 flex-1 min-h-[140px] max-h-[190px] rounded-lg overflow-hidden border border-white/25 shadow-lg relative bg-black/40">
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={heroSpecies.commonName || 'Hero species'}
            crossOrigin="anonymous"
            loading="eager"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
            Featured Specimen
          </div>
        )}

        {/* Hero Photo Switcher (hidden in print/PDF) */}
        {onChangePhoto && heroSpecies.id && (
          <button
            type="button"
            data-export-ignore="true"
            onClick={(e) => {
              e.stopPropagation();
              onChangePhoto(heroSpecies.id, 1);
            }}
            disabled={loadingPhotoSpeciesId === heroSpecies.id}
            className="no-print export-ignore absolute top-1.5 right-1.5 z-20 bg-black/80 hover:bg-black/95 text-white text-[8px] font-bold px-2 py-0.5 rounded backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20 transition-all cursor-pointer"
            title="Click to switch cover photo"
          >
            {loadingPhotoSpeciesId === heroSpecies.id ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-2.5 h-2.5 text-emerald-400" />
            )}
            <span>Cover Photo</span>
          </button>
        )}

        {/* Hero Species Label Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
          <div className="font-bold text-[10px] text-white leading-tight">
            {heroSpecies.commonName || 'Key Regional Species'}
          </div>
          <div className="text-[8px] italic text-emerald-200 leading-tight">
            {heroSpecies.scientificName}
          </div>
          {heroSpecies.photo?.photographer && (
            <div className="text-[6.5px] text-white/70 mt-0.5">
              Photo: © {heroSpecies.photo.photographer}
            </div>
          )}
        </div>
      </div>

      {/* Field Identification Tips & Anatomy Box */}
      <div className="bg-black/35 backdrop-blur-xs rounded-lg p-2 border border-white/15 text-[7.5px] leading-tight space-y-1 mb-2">
        <div className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
          <Compass className="w-2.5 h-2.5 text-emerald-300" />
          <span>Quick Field Identification Tips</span>
        </div>
        <p className="text-white/90">
          • Observe bill shape, overall silhouette, and tail proportions first.
        </p>
        <p className="text-white/90">
          • Note wing bars, eyestripes, and distinct plumage contrast.
        </p>
        <p className="text-white/90">
          • Cross-reference habitat, foraging behavior, and regional season.
        </p>
      </div>

      {/* Accordion Fold Schematic Footer */}
      <div className="border-t border-white/20 pt-1.5 flex items-center justify-between text-[7px] text-white/75">
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5 font-mono text-[6px]">
            <span className="bg-white/20 px-0.5 rounded-2xs">1</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">2</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">3</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">4</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">5</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">6</span>
          </div>
          <span>3.5" × 8.5" Accordion Fold</span>
        </div>
        <span className="font-bold text-white">Side 1 • Panel 1</span>
      </div>
    </div>
  );

  // Render Back Cover / Field Notes (Panel 12)
  const renderBackCover = () => (
    <div
      key="panel-12-back"
      className={`h-full flex flex-col justify-between ${themeStyles.bg} p-2 sm:p-2.5 rounded-none relative select-none min-h-0 overflow-hidden`}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className={`p-1.5 rounded-md ${themeStyles.headerBg} flex items-center justify-between`}>
          <div>
            <div className="text-[7px] font-black uppercase tracking-wider opacity-85">
              Field Checklist & Notes
            </div>
            <div className="text-[9.5px] font-bold">
              Citizen Science Record
            </div>
          </div>
          <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
        </div>

        {/* Observation Log Table */}
        <div className="bg-white border border-slate-200 rounded-md p-1.5 text-[7px] text-slate-700 space-y-1 shadow-2xs">
          <div className="font-bold text-slate-900 uppercase text-[6.5px] border-b border-slate-100 pb-0.5">
            Observation Trip Details
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-slate-400">Date:</span> ____________
            </div>
            <div>
              <span className="text-slate-400">Weather:</span> _________
            </div>
          </div>
          <div>
            <span className="text-slate-400">Location:</span> _____________________________
          </div>
          <div>
            <span className="text-slate-400">Observers:</span> ____________________________
          </div>
        </div>

        {/* Citizen Science Contribution Callout */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-1.5 text-[7px] text-emerald-950 space-y-0.5 shadow-2xs">
          <div className="font-bold flex items-center gap-1 text-emerald-800 text-[7.5px]">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>Contribute to Biodiversity Science</span>
          </div>
          <p className="leading-tight text-[6.5px] text-emerald-900">
            Every photo uploaded to <strong>iNaturalist</strong> helps scientists track regional migrations, breeding phenology, and habitat health.
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-[6.5px] text-emerald-800 pt-0.5">
            <li>Download the free iNaturalist app</li>
            <li>Photograph any organism encountered</li>
            <li>Submit observation to the global community</li>
          </ol>
        </div>
      </div>

      {/* Footer Info & Fold Guidelines */}
      <div className="border-t border-slate-200 pt-1 text-[6.5px] text-slate-400 space-y-0.5 shrink-0">
        <div className="flex items-center justify-between font-medium text-slate-600">
          <span>Data: Research-grade records</span>
          <span>© Creative Commons</span>
        </div>
        <p className="leading-tight text-[6px]">
          Folds down to 3.5" × 8.5" (89 × 216 mm) • Pocket Naturalist folding field guide standard.
        </p>
        <div className="text-right font-bold text-slate-500">
          Side 2 • Panel 12
        </div>
      </div>
    </div>
  );

  // Render standard Species Panel
  const renderSpeciesPanel = (panel) => {
    const rowsCount = cardLayout === 'grid'
      ? Math.ceil(panel.species.length / 2)
      : panel.species.length;

    return (
      <div
        key={`panel-${panel.panelNumber}`}
        className={`h-full flex flex-col justify-between ${themeStyles.bg} p-1 sm:p-1.5 rounded-none relative select-none min-h-0 overflow-hidden`}
      >
        {/* Species Container - Starts at the very top (panel header removed to maximize vertical space) */}
        <div
          className={`flex-1 min-h-0 ${
            cardLayout === 'grid'
              ? 'grid grid-cols-2 gap-1'
              : 'grid grid-cols-1 gap-1'
          }`}
          style={{
            gridTemplateRows: `repeat(${rowsCount}, minmax(0, 1fr))`,
          }}
        >
          {panel.species.map((s, idx) => renderSpeciesCard(s, panel.startRank + idx))}
        </div>

        {/* Minimal Hairline Footer */}
        <div className="mt-0.5 pt-0.5 border-t border-slate-200/60 flex items-center justify-between text-[6px] text-slate-400 shrink-0 leading-none">
          <span className="truncate">{taxonName || 'Species'} • {placeName || 'Guide'}</span>
          <span className="font-mono font-bold shrink-0 ml-1">
            Side {panel.panelNumber <= 6 ? '1' : '2'} • {panel.panelNumber}/12
          </span>
        </div>
      </div>
    );
  };

  // Helper to render a panel based on its type
  const renderPanel = (panel) => {
    if (panel.isCover) return renderFrontCover();
    if (panel.isBackCover) return renderBackCover();
    return renderSpeciesPanel(panel);
  };

  return (
    <div className="space-y-6">
      {/* Shortfall Alert: Prompt user to load 150 species if current count is low */}
      {species.length < 130 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs no-print">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Pocket Guides are Designed for 130–160 Common Species
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Currently, you have <strong>{species.length} species</strong> loaded. Waterford-style 12-panel folding guides work best with roughly 130–160 species across the 12 sides.
              </p>
            </div>
          </div>

          {onFetchCommonSpecies && (
            <button
              type="button"
              onClick={handleLoadCommon}
              disabled={isFetchingCommon}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all shrink-0 flex items-center gap-2 cursor-pointer"
            >
              {isFetchingCommon ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Top 150...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Fetch Top 150 Common Species</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Pocket Guide Cockpit Toolbar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 no-print">
        {/* Left: View / Print Format Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Columns className="w-4 h-4 text-emerald-600" />
            <span>Format:</span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewFormat('spread')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                viewFormat === 'spread'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full 6-panel panoramic spreads (21' x 8.5')"
            >
              <span>Full Spreads (21" × 8.5")</span>
            </button>

            <button
              type="button"
              onClick={() => setViewFormat('sheets')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                viewFormat === 'sheets'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Home printer friendly: 4 sheets of standard US Letter or A4 (3 panels per page)"
            >
              <span>US Letter / A4 (4 Sheets)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewFormat('panels')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                viewFormat === 'panels'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Individual 3.5' x 8.5' pocket panels (12 pages)"
            >
              <span>Single Panels (12 Pages)</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Species Density, Layout & Theme */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Target Species Count */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Species:</span>
            <select
              value={targetSpeciesCount}
              onChange={(e) => setTargetSpeciesCount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value={140}>140 Species (14/panel • Recommended)</option>
              <option value={154}>154 Species (14/panel • 11 panels)</option>
              <option value={132}>132 Species (12/panel • Spacious)</option>
              <option value={160}>160 Species (Maximum Density)</option>
            </select>
          </div>

          {/* Card Layout (Grid vs Compact) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setCardLayout('grid')}
              className={`p-1 rounded ${cardLayout === 'grid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'}`}
              title="2-column visual grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCardLayout('compact')}
              className={`p-1 rounded ${cardLayout === 'compact' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'}`}
              title="Compact horizontal list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTheme('naturalist')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                theme === 'naturalist' ? 'bg-[#1c3829] text-[#f4ecd8] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Naturalist
            </button>
            <button
              type="button"
              onClick={() => setTheme('classic')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                theme === 'classic' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Classic
            </button>
            <button
              type="button"
              onClick={() => setTheme('midnight')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                theme === 'midnight' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Midnight
            </button>
          </div>
        </div>
      </div>

      {/* Main Export Document Container */}
      <div id={id} className="space-y-8 print:space-y-0">
        {/* ========================================================= */}
        {/* MODE 1: FULL SPREADS (2 × 6-Panel Sheets: 21" × 8.5")     */}
        {/* ========================================================= */}
        {viewFormat === 'spread' && (
          <div className="space-y-6">
            {/* SPREAD 1: SIDE A (Panels 1 to 6) */}
            <div className="space-y-1.5 no-print">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>🌿 SPREAD 1 • SIDE A (PANELS 1 TO 6) — 21" × 8.5"</span>
                <span className="text-[11px] text-slate-400 font-normal">Folds into 3.5" × 8.5" panels</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-xl shadow-md p-1.5 page-break-after overflow-hidden min-w-[1100px] xl:min-w-[1280px] print:min-w-0`}
                data-pdf-width-mm="533.4"
                data-pdf-height-mm="215.9"
                style={{
                  width: '100%',
                  aspectRatio: '533.4 / 215.9',
                }}
              >
                <div className="grid grid-cols-6 h-full min-h-0 relative divide-x divide-dashed divide-slate-300">
                  {panelsData.slice(0, 6).map((panel) => (
                    <div key={`sideA-${panel.panelNumber}`} className="h-full min-h-0 min-w-0 px-1 overflow-hidden">
                      {renderPanel(panel)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SPREAD 2: SIDE B (Panels 7 to 12) */}
            <div className="space-y-1.5 no-print pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>🌿 SPREAD 2 • SIDE B (PANELS 7 TO 12) — 21" × 8.5"</span>
                <span className="text-[11px] text-slate-400 font-normal">Reverse side of folding sheet</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-xl shadow-md p-1.5 page-break-after overflow-hidden min-w-[1100px] xl:min-w-[1280px] print:min-w-0`}
                data-pdf-width-mm="533.4"
                data-pdf-height-mm="215.9"
                style={{
                  width: '100%',
                  aspectRatio: '533.4 / 215.9',
                }}
              >
                <div className="grid grid-cols-6 h-full min-h-0 relative divide-x divide-dashed divide-slate-300">
                  {panelsData.slice(6, 12).map((panel) => (
                    <div key={`sideB-${panel.panelNumber}`} className="h-full min-h-0 min-w-0 px-1 overflow-hidden">
                      {renderPanel(panel)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: PRINTABLE SHEETS (4 Sheets × 3 Panels - US Letter)*/}
        {/* ========================================================= */}
        {viewFormat === 'sheets' && (
          <div className="space-y-8 print:space-y-0">
            {[
              { title: 'Sheet 1 • Panels 1 to 3', panels: panelsData.slice(0, 3) },
              { title: 'Sheet 2 • Panels 4 to 6', panels: panelsData.slice(3, 6) },
              { title: 'Sheet 3 • Panels 7 to 9', panels: panelsData.slice(6, 9) },
              { title: 'Sheet 4 • Panels 10 to 12', panels: panelsData.slice(9, 12) },
            ].map((sheet, sIdx) => (
              <div key={`sheet-${sIdx}`} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 no-print">
                  <span>🌿 {sheet.title} (Standard Letter / A4 Landscape)</span>
                  <span className="text-[11px] text-slate-400 font-normal">3 panels of 3.5" × 8.5" = 10.5" × 8.5"</span>
                </div>

                <div
                  className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-xl shadow-md p-2 page-break-after overflow-hidden`}
                  data-pdf-width-mm="279.4"
                  data-pdf-height-mm="215.9"
                  style={{
                    width: '100%',
                    aspectRatio: '279.4 / 215.9',
                  }}
                >
                  <div className="grid grid-cols-3 h-full min-h-0 divide-x divide-dashed divide-slate-300">
                    {sheet.panels.map((panel) => (
                      <div key={`sheet-panel-${panel.panelNumber}`} className="h-full min-h-0 min-w-0 px-2 overflow-hidden">
                        {renderPanel(panel)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: INDIVIDUAL PANELS (12 Pages • 3.5" × 8.5")         */}
        {/* ========================================================= */}
        {viewFormat === 'panels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:block print:space-y-0">
            {panelsData.map((panel) => (
              <div key={`single-panel-${panel.panelNumber}`} className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 no-print flex items-center justify-between">
                  <span>Side {panel.panelNumber <= 6 ? '1' : '2'} • Panel {panel.panelNumber}</span>
                  <span className="text-slate-400 font-normal">3.5" × 8.5"</span>
                </div>

                <div
                  className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-xl shadow-md p-1.5 page-break-after overflow-hidden`}
                  data-pdf-width-mm="88.9"
                  data-pdf-height-mm="215.9"
                  style={{
                    width: '100%',
                    aspectRatio: '88.9 / 215.9',
                  }}
                >
                  {renderPanel(panel)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
