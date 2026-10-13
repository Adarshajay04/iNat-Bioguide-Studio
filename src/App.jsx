import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchPanel from './components/SearchPanel';
import OverlayControls from './components/OverlayControls';
import SpeciesList from './components/SpeciesList';
import ExportModal from './components/export/ExportModal';
import { fetchSpeciesCounts, fetchTaxonPhotos, PRESETS } from './services/inaturalist';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Search parameters state
  const [selectedTaxon, setSelectedTaxon] = useState(PRESETS[0].taxon);
  const [selectedPlace, setSelectedPlace] = useState(PRESETS[0].place);
  const [licenseFilter, setLicenseFilter] = useState('open');
  const [limit, setLimit] = useState(24); // number or 'all'

  // Species state
  const [species, setSpecies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const abortControllerRef = useRef(null);

  // Customizer / Overlay settings state
  const [showSettings, setShowSettings] = useState(true);
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

  // Perform search
  const handleSearch = async (params) => {
    // Cancel previous request if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
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

  const handleCancelFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setFetchProgress(null);
  };

  // Initial load with default preset on first mount
  useEffect(() => {
    handleSearch({
      placeId: PRESETS[0].place.id,
      taxonId: PRESETS[0].taxon.id,
      licenseFilter: 'open',
      perPage: 24,
    });
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenExport={() => setShowExportModal(true)}
        speciesCount={selectedSpecies.length}
        onToggleSettings={() => setShowSettings((v) => !v)}
        showSettings={showSettings}
      />

      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
          showExportModal ? 'no-print' : ''
        }`}
      >
        {/* Search & Location/Taxon Panel */}
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

        {/* Overlay Customizer (Scientific Name, Common Name & Copyright) */}
        <OverlayControls
          overlaySettings={overlaySettings}
          setOverlaySettings={setOverlaySettings}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-sm">Error Loading Observations</div>
              <div className="text-xs text-red-600 mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Species List & Grid */}
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
          isLoading={isLoading}
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
      />

      {/* Application Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built with <span className="text-emerald-600 font-bold">iNaturalist Open API</span> • Open Source Biodiversity Data
          </div>
          <div>
            Supports Scrollable PDF Field Guides • Tri-fold Pamphlets • High-Res Wall Posters
          </div>
        </div>
      </footer>
    </div>
  );
}
