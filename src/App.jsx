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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
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
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
          showExportModal ? 'no-print' : ''
        } ${!hasFetched && species.length === 0 ? 'flex flex-col justify-center min-h-[65vh]' : ''}`}
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

        {/* Optional Step: Image Overlay & Typography Customizer Accordion (Centralized) */}
        <div className="max-w-3xl mx-auto mb-6 no-print">
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-950/60 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 flex items-center justify-center transition-colors">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                    Optional Step
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Image Overlay & Typography Customizer
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                  Fine-tune scientific names, common names, badges, positions, and copyright overlays
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5">
                <span>{showSettings ? 'Hide Customizer' : 'Open Customizer'}</span>
                {showSettings ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </div>
          </button>

          {showSettings && (
            <div className="mt-3">
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
          <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-sm">Error Loading Observations</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorMessage}</div>
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
      <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built with <span className="text-emerald-600 dark:text-emerald-400 font-bold">iNaturalist Open API</span> • Open Source Biodiversity Data
          </div>
          <div>
            Supports Scrollable PDF Field Guides • Tri-fold Pamphlets • Folding Pocket Guides (12-Panel) • Wall Posters
          </div>
        </div>
      </footer>
    </div>
  );
}
