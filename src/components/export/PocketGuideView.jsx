import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  RefreshCw,
  Loader2,
  Columns,
  CheckSquare,
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
  // Color theme: 'naturalist' (Waterford Press ivory & deep forest) | 'classic' (archival monochrome) | 'midnight' (deep slate field plate)
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
  const hasBackCoverOnly = targetSpeciesCount <= 140;
  const numSpeciesPanels = hasBackCoverOnly ? 10 : 11;
  const speciesPerPanel = Math.ceil(commonSpecies.length / (numSpeciesPanels || 1)) || 14;

  // Distribute species into the 12 panels
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

  // Authentic Naturalist Theme styling definitions
  const themeStyles = {
    naturalist: {
      bg: 'bg-[#faf8f2]',
      border: 'border-[#dfd8c8]',
      cardBg: 'bg-white',
      headerBg: 'bg-[#1a382b] text-[#f4ecd8]',
      accentText: 'text-[#1a382b]',
      badgeBg: 'bg-[#254d3b]',
      coverBg: 'bg-[#1a382b]',
      coverAccent: 'text-[#e5ca80]',
      foldLine: 'border-[#c8bea9]',
    },
    classic: {
      bg: 'bg-white',
      border: 'border-stone-300',
      cardBg: 'bg-stone-50/60',
      headerBg: 'bg-stone-900 text-stone-100',
      accentText: 'text-stone-900',
      badgeBg: 'bg-stone-800',
      coverBg: 'bg-stone-900',
      coverAccent: 'text-stone-300',
      foldLine: 'border-stone-300',
    },
    midnight: {
      bg: 'bg-stone-950',
      border: 'border-stone-800',
      cardBg: 'bg-stone-900 text-stone-100',
      headerBg: 'bg-black text-stone-200',
      accentText: 'text-stone-200',
      badgeBg: 'bg-stone-800',
      coverBg: 'bg-black',
      coverAccent: 'text-stone-300',
      foldLine: 'border-stone-800',
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
          className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-xs p-1 flex items-center gap-1.5 shadow-2xs relative group`}
        >
          {/* Thumbnail */}
          <div className="relative w-8 h-8 rounded-2xs shrink-0 overflow-hidden bg-stone-200">
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
              <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">sp.</div>
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
                title="Switch specimen photo"
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
              <span className="text-[7.5px] font-mono text-stone-400 shrink-0">#{rank}</span>
              <span className={`text-[8.5px] font-semibold truncate ${theme === 'midnight' ? 'text-white' : 'text-stone-900'}`}>
                {nameOrder === 'scientific_first' ? s.scientificName : s.commonName}
              </span>
            </div>
            <div className="text-[7px] italic font-serif text-stone-500 truncate mt-0.5">
              {nameOrder === 'scientific_first' ? s.commonName : s.scientificName}
            </div>
          </div>

          {/* Sighting Checkbox */}
          <div className="w-3 h-3 rounded-2xs border border-stone-400 shrink-0 flex items-center justify-center bg-white/90" />
        </div>
      );
    }

    // Default: 'grid' layout (2 columns × 7 rows per panel)
    return (
      <div
        key={s.id}
        className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-2xs overflow-hidden flex flex-col justify-between shadow-2xs relative group min-h-0 h-full`}
      >
        {/* Photo Container - min-h-0 ensures photo fills space cleanly without overflowing */}
        <div className="flex-1 min-h-0 relative bg-stone-100 overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">Specimen</div>
          )}

          {/* Sighting tick-box */}
          <div
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-2xs bg-white/95 border border-stone-600/60 flex items-center justify-center shadow-2xs"
            title="Tick when observed in the field"
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
              className="no-print export-ignore absolute bottom-0.5 right-0.5 z-20 bg-stone-900/85 hover:bg-black text-stone-100 text-[6.5px] font-mono px-1 py-0.2 rounded-2xs flex items-center gap-0.5 border border-white/20 transition-all cursor-pointer"
              title="Cycle alternative photo"
            >
              {loadingPhotoSpeciesId === s.id ? (
                <Loader2 className="w-2 h-2 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-2 h-2 text-stone-300" />
              )}
              <span>{s.photosList && s.photosList.length > 1 ? `${(s.photoIndex ?? 0) + 1}/${s.photosList.length}` : 'Alt'}</span>
            </button>
          )}

          {/* Mini Copyright overlay */}
          {showAuthorCopyright && (
            <div className="absolute bottom-0 left-0 right-0 bg-stone-900/75 px-1 py-0.2 pointer-events-none">
              <div className="text-[5.5px] font-mono text-stone-300 truncate leading-none">
                © {photographer}{licenseTag}
              </div>
            </div>
          )}
        </div>

        {/* Labels & Taxonomy */}
        <div className="px-1 py-0.5 shrink-0 leading-tight">
          {nameOrder === 'common_first' ? (
            <>
              {showCommonNameTop && (
                <div className={`font-semibold text-[8px] leading-tight truncate ${theme === 'midnight' ? 'text-white' : 'text-stone-900'}`}>
                  {s.commonName}
                </div>
              )}
              {showScientificNameTop && (
                <div className="text-[6.5px] italic font-serif text-stone-500 leading-tight truncate">
                  {s.scientificName}
                </div>
              )}
            </>
          ) : (
            <>
              {showScientificNameTop && (
                <div className={`font-semibold italic font-serif text-[8px] leading-tight truncate ${theme === 'midnight' ? 'text-white' : 'text-stone-900'}`}>
                  {s.scientificName}
                </div>
              )}
              {showCommonNameTop && (
                <div className="text-[6.5px] text-stone-500 leading-tight truncate">
                  {s.commonName}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Front Cover (Panel 1) - Authentic Waterford Pocket Naturalist Design
  const renderFrontCover = () => (
    <div
      key="panel-1-cover"
      className={`h-full flex flex-col justify-between ${themeStyles.coverBg} text-white p-3 sm:p-3.5 rounded-none relative overflow-hidden select-none`}
    >
      {/* Top Header Block */}
      <div>
        <div className="border-b border-white/20 pb-1 mb-2 flex items-center justify-between">
          <span className={`text-[7.5px] font-bold uppercase tracking-widest ${themeStyles.coverAccent}`}>
            Pocket Naturalist® Field Guide
          </span>
          <span className="text-[7px] font-mono text-stone-300">
            12-PANEL EDITION
          </span>
        </div>

        <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight leading-none text-white font-serif">
          {taxonName || 'Wildlife'}
        </h1>

        <div className="flex items-center gap-1 text-[10px] font-medium text-stone-200 mt-1">
          <MapPin className="w-3 h-3 shrink-0 text-[#e5ca80]" />
          <span className="truncate">{placeName || 'Regional Area'}</span>
        </div>

        <div className="text-[7.5px] text-stone-300 mt-0.5 leading-tight font-serif italic">
          A Folding Guide to {commonSpecies.length || 140} Familiar & Characteristic Species
        </div>
      </div>

      {/* Featured Specimen Photograph */}
      <div className="my-1.5 flex-1 min-h-[140px] max-h-[185px] rounded-xs overflow-hidden border border-white/25 shadow-xs relative bg-stone-900">
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={heroSpecies.commonName || 'Hero species'}
            crossOrigin="anonymous"
            loading="eager"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
            Featured Specimen
          </div>
        )}

        {/* Hero Photo Switcher */}
        {onChangePhoto && heroSpecies.id && (
          <button
            type="button"
            data-export-ignore="true"
            onClick={(e) => {
              e.stopPropagation();
              onChangePhoto(heroSpecies.id, 1);
            }}
            disabled={loadingPhotoSpeciesId === heroSpecies.id}
            className="no-print export-ignore absolute top-1.5 right-1.5 z-20 bg-stone-900/90 hover:bg-black text-white text-[7.5px] font-mono px-1.5 py-0.5 rounded-2xs flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
            title="Switch cover photo"
          >
            {loadingPhotoSpeciesId === heroSpecies.id ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-2.5 h-2.5 text-stone-300" />
            )}
            <span>Cover Photo</span>
          </button>
        )}

        {/* Hero Species Label Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-stone-900/90 border-t border-white/10 p-1.5">
          <div className="font-semibold text-[9.5px] text-white leading-tight">
            {heroSpecies.commonName || 'Key Representative Species'}
          </div>
          <div className="text-[8px] italic font-serif text-[#e5ca80] leading-tight">
            {heroSpecies.scientificName}
          </div>
          {heroSpecies.photo?.photographer && (
            <div className="text-[6px] font-mono text-stone-300 mt-0.5">
              Photo: © {heroSpecies.photo.photographer}
            </div>
          )}
        </div>
      </div>

      {/* Field Identification Key */}
      <div className="bg-black/30 rounded-xs p-2 border border-white/15 text-[7px] leading-tight space-y-1 mb-1.5">
        <div className="font-semibold text-white uppercase tracking-wider flex items-center gap-1 text-[7.5px]">
          <Compass className="w-2.5 h-2.5 text-[#e5ca80]" />
          <span>Field Identification Key</span>
        </div>
        <p className="text-stone-200">
          • Silhouette & Bill: Observe bill shape, body silhouette, and perching posture first.
        </p>
        <p className="text-stone-200">
          • Plumage Patterns: Examine wing bars, eyestripe, throat patch, and tail markings.
        </p>
        <p className="text-stone-200">
          • Behavior & Habitat: Cross-reference canopy stratum, flight pattern, and regional season.
        </p>
      </div>

      {/* Accordion Fold Schematic Footer */}
      <div className="border-t border-white/20 pt-1 flex items-center justify-between text-[6.5px] text-stone-300">
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5 font-mono text-[5.5px]">
            <span className="bg-white/25 px-0.5 rounded-2xs font-bold text-white">1</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">2</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">3</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">4</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">5</span>
            <span className="bg-white/10 px-0.5 rounded-2xs">6</span>
          </div>
          <span>3.5" × 8.5" Accordion Format</span>
        </div>
        <span className="font-semibold text-white font-mono">Side 1 • Panel 1</span>
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
        <div className={`p-1.5 rounded-xs ${themeStyles.headerBg} flex items-center justify-between`}>
          <div>
            <div className="text-[6.5px] font-bold uppercase tracking-wider opacity-85">
              Field Observation Record
            </div>
            <div className="text-[9px] font-bold font-serif">
              Citizen Science Field Log
            </div>
          </div>
          <CheckSquare className="w-3 h-3 text-[#e5ca80]" />
        </div>

        {/* Observation Log Table */}
        <div className="bg-white border border-stone-200 rounded-xs p-1.5 text-[7px] text-stone-700 space-y-1 shadow-2xs font-mono">
          <div className="font-semibold text-stone-900 uppercase text-[6.5px] border-b border-stone-100 pb-0.5 font-sans">
            Observation Trip Details
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-stone-400">Date:</span> ____________
            </div>
            <div>
              <span className="text-stone-400">Weather:</span> _________
            </div>
          </div>
          <div>
            <span className="text-stone-400">Location:</span> _____________________________
          </div>
          <div>
            <span className="text-stone-400">Observers:</span> ____________________________
          </div>
        </div>

        {/* Citizen Science Contribution Callout */}
        <div className="bg-stone-50 border border-stone-200 rounded-xs p-1.5 text-[7px] text-stone-800 space-y-0.5 shadow-2xs">
          <div className="font-semibold flex items-center gap-1 text-stone-900 text-[7.5px]">
            <span>Contribute to Biodiversity Science</span>
          </div>
          <p className="leading-tight text-[6.5px] text-stone-600">
            Observation records documented in this guide are curated from research-grade observations deposited on <strong>iNaturalist</strong> and GBIF.
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-[6.5px] text-stone-600 pt-0.5 font-mono">
            <li>Download the free iNaturalist application</li>
            <li>Photograph organism encountered in the field</li>
            <li>Submit observation for global research verification</li>
          </ol>
        </div>
      </div>

      {/* Footer Info & Fold Guidelines */}
      <div className="border-t border-stone-200 pt-1 text-[6.5px] text-stone-400 space-y-0.5 shrink-0">
        <div className="flex items-center justify-between font-mono text-stone-600 text-[6px]">
          <span>Data: Research-grade records</span>
          <span>© Creative Commons</span>
        </div>
        <p className="leading-tight text-[6px]">
          Folds down to 3.5" × 8.5" (89 × 216 mm) • Pocket Naturalist accordion standard.
        </p>
        <div className="text-right font-mono font-semibold text-stone-500 text-[6.5px]">
          Side 2 • Panel 12 (Back)
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
        <div className="mt-0.5 pt-0.5 border-t border-stone-200/60 flex items-center justify-between text-[6px] text-stone-400 shrink-0 leading-none font-mono">
          <span className="truncate">{taxonName || 'Species'} • {placeName || 'Guide'}</span>
          <span className="font-bold shrink-0 ml-1">
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
    <div className="space-y-4">
      {/* Shortfall Alert: Prompt user to load 150 species if current count is low */}
      {species.length < 130 && (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs no-print text-xs">
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100">
              12-Panel Pocket Guides are Calibrated for 130–160 Species
            </h4>
            <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed text-[11px]">
              Currently loaded: <strong>{species.length} species</strong>. For full Waterford-style accordion plates, roughly 130–160 common species fill all 12 panels.
            </p>
          </div>

          {onFetchCommonSpecies && (
            <button
              type="button"
              onClick={handleLoadCommon}
              disabled={isFetchingCommon}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 text-white shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {isFetchingCommon ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Top 150...</span>
                </>
              ) : (
                <span>Fetch Top 150 Common Species</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Pocket Guide Workbench Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-2xs border border-stone-200 dark:border-stone-800 p-3 flex flex-wrap items-center justify-between gap-3 no-print transition-colors duration-200">
        {/* Left: View / Print Format Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <Columns className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <span>Format:</span>
          </div>

          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-md border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setViewFormat('spread')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                viewFormat === 'spread'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Full 6-panel panoramic spreads (21' x 8.5')"
            >
              Full Spreads (21" × 8.5")
            </button>

            <button
              type="button"
              onClick={() => setViewFormat('sheets')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                viewFormat === 'sheets'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Home printer friendly: 4 sheets of standard US Letter or A4 (3 panels per page)"
            >
              US Letter / A4 (4 Sheets)
            </button>

            <button
              type="button"
              onClick={() => setViewFormat('panels')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                viewFormat === 'panels'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Individual 3.5' x 8.5' pocket panels (12 pages)"
            >
              Single Panels (12 Pages)
            </button>
          </div>
        </div>

        {/* Right Controls: Species Density, Layout & Theme */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Target Species Count */}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-stone-600 dark:text-stone-400">Species:</span>
            <select
              value={targetSpeciesCount}
              onChange={(e) => setTargetSpeciesCount(Number(e.target.value))}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value={140}>140 Species (14/panel • Standard)</option>
              <option value={154}>154 Species (14/panel • 11 panels)</option>
              <option value={132}>132 Species (12/panel • Spacious)</option>
              <option value={160}>160 Species (Maximum Density)</option>
            </select>
          </div>

          {/* Card Layout (Grid vs Compact) */}
          <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setCardLayout('grid')}
              className={`p-1 rounded cursor-pointer ${cardLayout === 'grid' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500'}`}
              title="2-column visual grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCardLayout('compact')}
              className={`p-1 rounded cursor-pointer ${cardLayout === 'compact' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500'}`}
              title="Compact horizontal list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded border border-stone-200 dark:border-stone-700 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setTheme('naturalist')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                theme === 'naturalist' ? 'bg-[#1a382b] text-[#f4ecd8] font-medium shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Naturalist
            </button>
            <button
              type="button"
              onClick={() => setTheme('classic')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                theme === 'classic' ? 'bg-stone-900 text-white font-medium shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Classic
            </button>
            <button
              type="button"
              onClick={() => setTheme('midnight')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                theme === 'midnight' ? 'bg-stone-800 text-stone-100 font-medium shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Midnight
            </button>
          </div>
        </div>
      </div>

      {/* Main Export Document Container */}
      <div id={id} className="space-y-6 print:space-y-0">
        {/* ========================================================= */}
        {/* MODE 1: FULL SPREADS (2 × 6-Panel Sheets: 21" × 8.5")     */}
        {/* ========================================================= */}
        {viewFormat === 'spread' && (
          <div className="space-y-5">
            {/* SPREAD 1: SIDE A (Panels 1 to 6) */}
            <div className="space-y-1 no-print">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 font-mono">
                <span>SPREAD 1 • SIDE A (PANELS 1 TO 6) — 21" × 8.5"</span>
                <span className="text-[11px] text-stone-400 font-normal">Folds to 3.5" × 8.5" accordion</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-none shadow-xs p-1 page-break-after overflow-hidden min-w-[1100px] xl:min-w-[1280px] print:min-w-0`}
                data-pdf-width-mm="533.4"
                data-pdf-height-mm="215.9"
                style={{
                  width: '100%',
                  aspectRatio: '533.4 / 215.9',
                }}
              >
                <div className="grid grid-cols-6 h-full min-h-0 relative divide-x divide-dashed divide-stone-300 dark:divide-stone-700">
                  {panelsData.slice(0, 6).map((panel) => (
                    <div key={`sideA-${panel.panelNumber}`} className="h-full min-h-0 min-w-0 px-1 overflow-hidden">
                      {renderPanel(panel)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SPREAD 2: SIDE B (Panels 7 to 12) */}
            <div className="space-y-1 no-print pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 font-mono">
                <span>SPREAD 2 • SIDE B (PANELS 7 TO 12) — 21" × 8.5"</span>
                <span className="text-[11px] text-stone-400 font-normal">Reverse side of sheet</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-none shadow-xs p-1 page-break-after overflow-hidden min-w-[1100px] xl:min-w-[1280px] print:min-w-0`}
                data-pdf-width-mm="533.4"
                data-pdf-height-mm="215.9"
                style={{
                  width: '100%',
                  aspectRatio: '533.4 / 215.9',
                }}
              >
                <div className="grid grid-cols-6 h-full min-h-0 relative divide-x divide-dashed divide-stone-300 dark:divide-stone-700">
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
          <div className="space-y-6 print:space-y-0">
            {[
              { title: 'Sheet 1 • Panels 1 to 3', panels: panelsData.slice(0, 3) },
              { title: 'Sheet 2 • Panels 4 to 6', panels: panelsData.slice(3, 6) },
              { title: 'Sheet 3 • Panels 7 to 9', panels: panelsData.slice(6, 9) },
              { title: 'Sheet 4 • Panels 10 to 12', panels: panelsData.slice(9, 12) },
            ].map((sheet, sIdx) => (
              <div key={`sheet-${sIdx}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 no-print font-mono">
                  <span>{sheet.title} (Letter / A4 Landscape)</span>
                  <span className="text-[11px] text-stone-400 font-normal">3 panels = 10.5" × 8.5"</span>
                </div>

                <div
                  className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-none shadow-xs p-1.5 page-break-after overflow-hidden`}
                  data-pdf-width-mm="279.4"
                  data-pdf-height-mm="215.9"
                  style={{
                    width: '100%',
                    aspectRatio: '279.4 / 215.9',
                  }}
                >
                  <div className="grid grid-cols-3 h-full min-h-0 divide-x divide-dashed divide-stone-300 dark:divide-stone-700">
                    {sheet.panels.map((panel) => (
                      <div key={`sheet-panel-${panel.panelNumber}`} className="h-full min-h-0 min-w-0 px-1.5 overflow-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:block print:space-y-0">
            {panelsData.map((panel) => (
              <div key={`single-panel-${panel.panelNumber}`} className="space-y-1">
                <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 no-print flex items-center justify-between font-mono">
                  <span>Side {panel.panelNumber <= 6 ? '1' : '2'} • Panel {panel.panelNumber}</span>
                  <span className="text-stone-400 font-normal">3.5" × 8.5"</span>
                </div>

                <div
                  className={`pdf-page ${themeStyles.bg} border ${themeStyles.border} rounded-none shadow-xs p-1 page-break-after overflow-hidden`}
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
