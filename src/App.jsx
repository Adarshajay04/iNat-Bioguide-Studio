import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchPanel from './components/SearchPanel';
import OverlayControls from './components/OverlayControls';
import SpeciesList from './components/SpeciesList';
import ExportModal from './components/export/ExportModal';
import { fetchSpeciesCounts, fetchTaxonPhotos, PRESETS } from './services/inaturalist';
import { AlertCircle, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  // Search parameters state (Default: Birds of Assam)
  const [selectedTaxon, setSelectedTaxon] = useState(PRESETS[0].taxon);
  const [selectedPlace, setSelectedPlace] = useState(PRESETS[0].place);
  const [licenseFilter, setLicenseFilter] = useState('open');
  const [limit, setLimit] = useState(24); // number or 'all'

  // Dark mode state with localStorage persistence & system preference fallback
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bioguide_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bioguide_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bioguide_theme', 'light');
    }
  }, [darkMode]);

  // Species state
  const [species, setSpecies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const abortControllerRef = useRef(null);

  // Customizer / Overlay settings state (Optional step: collapsed by default)
  const [showSettings, setShowSettings] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState({
    showCommonNameTop: true,
    showScientificNameTop: true,
    nameOrder: 'common_first',
    badgeStyle: 'frosted_dark',
    topPosition: 'top-left',
    showAuthorCopyright: true,
    showLicenseCode: true,
    bottomStyle: 'dark_pill',
  });

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Perform search (Data is fetched only after user clicks Fetch)
  const handleSearch = async (params = {}) => {
    // Cancel previous request if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setHasFetched(true);
    setFetchProgress(null);
    setErrorMessage(null);

    const queryLimit = params.perPage !== undefined ? params.perPage : limit;

    try {
      const data = await fetchSpeciesCounts({
        placeId: params.placeId !== undefined ? params.placeId : selectedPlace?.id,
        taxonId: params.taxonId !== undefined ? params.taxonId : selectedTaxon?.id,
        licenseFilter: params.licenseFilter || licenseFilter,
        perPage: queryLimit,
        onProgress: (prog) => {
          setFetchProgress(prog);
        },
        abortSignal: abortControllerRef.current.signal,
      });

      setSpecies(data.species);
      setTotalResults(data.totalResults);
      // Select all by default
      setSelectedIds(new Set(data.species.map((s) => s.id)));
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Search cancelled by user');
        return;
      }
      console.error('Failed to load species:', err);
      setErrorMessage(
        'Could not fetch species data from iNaturalist. Please verify your connection or try another region/taxon.'
      );
    } finally {
      setIsLoading(false);
      setFetchProgress(null);
    }
  };

  // 1-Click trigger to fetch all regional species
  const handleFetchAllSpecies = () => {
    setLimit('all');
    handleSearch({
      placeId: selectedPlace?.id,
      taxonId: selectedTaxon?.id,
      licenseFilter,
      perPage: 'all',
    });
  };

  // 1-Click trigger to fetch top N common species (for 12-panel Pocket Guide)
  const handleFetchCommonSpecies = (count = 150) => {
    setLimit(count);
    handleSearch({
      placeId: selectedPlace?.id,
      taxonId: selectedTaxon?.id,
      licenseFilter,
      perPage: count,
    });
  };

  const handleCancelFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setFetchProgress(null);
  };

  // Selection toggles
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(species.map((s) => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSelectTopN = (n) => {
    const topSlice = species.slice(0, n);
    setSelectedIds(new Set(topSlice.map((s) => s.id)));
  };

  // Photo Switcher: Cycle to alternative photos for better visibility (bird face / features)
  const [loadingPhotoSpeciesId, setLoadingPhotoSpeciesId] = useState(null);

  const handleChangeSpeciesPhoto = async (speciesId, direction = 1) => {
    const target = species.find((s) => s.id === speciesId);
    if (!target) return;

    // 1. If photosList is already fetched and has multiple photos
    if (target.photosList && target.photosList.length > 1) {
      const currentIdx = target.photoIndex !== undefined ? target.photoIndex : 0;
      const nextIdx = (currentIdx + direction + target.photosList.length) % target.photosList.length;
      const nextPhoto = target.photosList[nextIdx];

      setSpecies((prev) =>
        prev.map((s) =>
          s.id === speciesId
            ? { ...s, photo: nextPhoto, photoIndex: nextIdx }
            : s
        )
      );
      return;
    }

    // 2. Fetch alternative photos on-demand from iNaturalist
    try {
      setLoadingPhotoSpeciesId(speciesId);
      const fetchedPhotos = await fetchTaxonPhotos(speciesId);

      // Build complete unique photos list, preserving original default photo at front
      let allPhotos = [...fetchedPhotos];
      if (target.photo && !allPhotos.some((p) => p.id === target.photo.id)) {
        allPhotos.unshift(target.photo);
      }

      if (allPhotos.length <= 1) {
        // Only 1 photo exists on iNaturalist for this species
        setLoadingPhotoSpeciesId(null);
        return;
      }

      const nextIdx = 1;
      const nextPhoto = allPhotos[nextIdx];

      setSpecies((prev) =>
        prev.map((s) =>
          s.id === speciesId
            ? { ...s, photosList: allPhotos, photo: nextPhoto, photoIndex: nextIdx }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to switch photo for species:', speciesId, err);
    } finally {
      setLoadingPhotoSpeciesId(null);
    }
  };

  // Filter species currently selected for export
  const selectedSpecies = species.filter((s) => selectedIds.has(s.id));
  const placeTitle = selectedPlace?.display_name || selectedPlace?.name || 'Region';
  const taxonTitle = selectedTaxon?.preferred_common_name || selectedTaxon?.name || 'Species';

  return (
    <div
      className={`min-h-screen bg-stone-50/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200 ${
        !hasFetched && species.length === 0 && !showSettings
          ? 'h-screen overflow-hidden'
          : ''
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenExport={() => setShowExportModal(true)}
        speciesCount={selectedSpecies.length}
        onToggleSettings={() => setShowSettings((v) => !v)}
        showSettings={showSettings}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          showExportModal ? 'no-print' : ''
        } ${
          !hasFetched && species.length === 0
            ? 'max-w-4xl flex flex-col justify-center items-center py-2 sm:py-3'
            : 'max-w-7xl py-5 sm:py-7'
        }`}
      >
        {/* Step 1: Centralized Single-Step Taxa & Geographic Region Panel */}
        <SearchPanel
          onSearch={handleSearch}
          isLoading={isLoading}
          selectedTaxon={selectedTaxon}
          setSelectedTaxon={setSelectedTaxon}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          licenseFilter={licenseFilter}
          setLicenseFilter={setLicenseFilter}
          limit={limit}
          setLimit={setLimit}
          fetchProgress={fetchProgress}
          onCancelFetch={handleCancelFetch}
        />

        {/* Optional Formatting Bar (Centralized) */}
        <div className="max-w-3xl mx-auto w-full mb-0 no-print">
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-lg transition-colors cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Plate Formatting & Attribution Settings
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                — scientific binomial hierarchy, attribution overlays & watermarks
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              <span>{showSettings ? 'Hide Options' : 'Configure Options'}</span>
              {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </button>

          {showSettings && (
            <div className="mt-2.5">
              <OverlayControls
                overlaySettings={overlaySettings}
                setOverlaySettings={setOverlaySettings}
                isOpen={true}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-lg mt-3 mb-1 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Query Error</div>
              <div className="text-stone-600 dark:text-stone-400 mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Species List & Grid (Displays data only after user clicks Fetch) */}
        <SpeciesList
          species={species}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSelectTopN={handleSelectTopN}
          onOpenExport={() => setShowExportModal(true)}
          overlaySettings={overlaySettings}
          totalResults={totalResults}
          selectedPlace={selectedPlace}
          selectedTaxon={selectedTaxon}
          onFetchAllSpecies={handleFetchAllSpecies}
          onFetchCommonSpecies={handleFetchCommonSpecies}
          onTriggerFetch={() => handleSearch({})}
          isLoading={isLoading}
          hasFetched={hasFetched}
          onChangePhoto={handleChangeSpeciesPhoto}
          loadingPhotoSpeciesId={loadingPhotoSpeciesId}
        />
      </main>

      {/* Export Modal Cockpit */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        species={selectedSpecies}
        placeName={placeTitle}
        taxonName={taxonTitle}
        overlaySettings={overlaySettings}
        onChangePhoto={handleChangeSpeciesPhoto}
        loadingPhotoSpeciesId={loadingPhotoSpeciesId}
        onOpenSettings={() => {
          setShowExportModal(false);
          setShowSettings(true);
        }}
        onFetchCommonSpecies={handleFetchCommonSpecies}
      />

      {/* Application Footer */}
      <footer
        className={`bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 no-print transition-colors duration-200 shrink-0 ${
          !hasFetched && species.length === 0 ? 'py-2.5' : 'mt-12 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] font-mono">
          <div>
            BioGuide Studio • Research-grade biodiversity data via iNaturalist API
          </div>
          <div className="font-sans text-stone-400 dark:text-stone-500">
            Publishing Folding Pocket Guides (12-Panel), Field Checklists & Educational Pamphlets
          </div>
        </div>
      </footer>
    </div>
  );
}
