import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Feather, X, Loader2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { searchTaxa, searchPlaces, PRESETS, toCorsSafeUrl } from '../services/inaturalist';

export default function SearchPanel({
  onSearch,
  isLoading,
  selectedTaxon,
  setSelectedTaxon,
  selectedPlace,
  setSelectedPlace,
  licenseFilter,
  setLicenseFilter,
  limit,
  setLimit,
  fetchProgress,
  onCancelFetch,
}) {
  // Taxon autocomplete state
  const [taxonQuery, setTaxonQuery] = useState(
    selectedTaxon?.preferred_common_name || selectedTaxon?.name || ''
  );
  const [taxonResults, setTaxonResults] = useState([]);
  const [isTaxonLoading, setIsTaxonLoading] = useState(false);
  const [showTaxonDropdown, setShowTaxonDropdown] = useState(false);

  // Place autocomplete state
  const [placeQuery, setPlaceQuery] = useState(
    selectedPlace?.display_name || selectedPlace?.name || ''
  );
  const [placeResults, setPlaceResults] = useState([]);
  const [isPlaceLoading, setIsPlaceLoading] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  // Regional presets toggle
  const [showPresets, setShowPresets] = useState(false);

  const taxonBoxRef = useRef(null);
  const placeBoxRef = useRef(null);

  // Keep input text in sync when selectedTaxon or selectedPlace changes
  useEffect(() => {
    if (selectedTaxon) {
      const name = selectedTaxon.preferred_common_name || selectedTaxon.name || '';
      setTaxonQuery(name);
    }
  }, [selectedTaxon]);

  useEffect(() => {
    if (selectedPlace) {
      const name = selectedPlace.display_name || selectedPlace.name || '';
      setPlaceQuery(name);
    }
  }, [selectedPlace]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (taxonBoxRef.current && !taxonBoxRef.current.contains(e.target)) {
        setShowTaxonDropdown(false);
      }
      if (placeBoxRef.current && !placeBoxRef.current.contains(e.target)) {
        setShowPlaceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Taxon Search
  useEffect(() => {
    if (!taxonQuery || taxonQuery.trim().length < 2 || selectedTaxon) {
      setTaxonResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsTaxonLoading(true);
      const res = await searchTaxa(taxonQuery);
      setTaxonResults(res);
      setIsTaxonLoading(false);
      setShowTaxonDropdown(true);
    }, 280);
    return () => clearTimeout(timer);
  }, [taxonQuery, selectedTaxon]);

  // Debounced Place Search
  useEffect(() => {
    if (!placeQuery || placeQuery.trim().length < 2 || selectedPlace) {
      setPlaceResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsPlaceLoading(true);
      const res = await searchPlaces(placeQuery);
      setPlaceResults(res);
      setIsPlaceLoading(false);
      setShowPlaceDropdown(true);
    }, 280);
    return () => clearTimeout(timer);
  }, [placeQuery, selectedPlace]);

  // Preset Handler
  const handleApplyPreset = (preset) => {
    setSelectedTaxon(preset.taxon);
    setSelectedPlace(preset.place);
    onSearch({
      taxonId: preset.taxon.id,
      placeId: preset.place.id,
      licenseFilter,
      perPage: limit,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedTaxon && !selectedPlace) return;
    onSearch({
      taxonId: selectedTaxon?.id,
      placeId: selectedPlace?.id,
      licenseFilter,
      perPage: limit,
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 mb-3 sm:mb-4 no-print shadow-xs transition-colors duration-200">
      {/* Authentic Biological Query Header */}
      <div className="text-center mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Species Checklist Query
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
          Query research-grade observations and verified community photography from iNaturalist
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Centralized Two-Column Query Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Taxon Autocomplete Input */}
          <div className="relative text-left" ref={taxonBoxRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Feather className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Taxon / Clade</span>
              </label>
              {selectedTaxon && (
                <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                  {selectedTaxon.rank || 'taxon'}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Birds (Aves), Butterflies, Orchidaceae..."
                value={taxonQuery}
                onChange={(e) => {
                  setTaxonQuery(e.target.value);
                  setSelectedTaxon(null);
                }}
                onFocus={() => {
                  if (taxonResults.length > 0) setShowTaxonDropdown(true);
                }}
                className={`w-full pl-3 pr-8 py-2 rounded-lg border text-xs sm:text-sm transition-colors outline-none ${
                  selectedTaxon
                    ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 text-stone-900 dark:text-stone-100 font-medium'
                    : 'border-stone-300 dark:border-stone-700 focus:border-emerald-700 dark:focus:border-emerald-500 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400'
                }`}
              />

              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {isTaxonLoading && <Loader2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 animate-spin" />}
                {selectedTaxon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(null);
                      setTaxonQuery('');
                    }}
                    className="p-0.5 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title="Clear taxon selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
            </div>

            {/* Taxon Autocomplete Dropdown */}
            {showTaxonDropdown && taxonResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white dark:bg-stone-850 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {taxonResults.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(t);
                      setTaxonQuery(t.preferred_common_name || t.name);
                      setShowTaxonDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between transition-colors text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {t.default_photo ? (
                        <img
                          src={toCorsSafeUrl(t.default_photo.square_url)}
                          alt={t.name}
                          crossOrigin="anonymous"
                          className="w-6 h-6 rounded object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 text-[10px] shrink-0">
                          🌿
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {t.preferred_common_name || t.name}
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 italic truncate font-serif">
                          {t.name} {t.rank ? `(${t.rank})` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Place Autocomplete Input */}
          <div className="relative text-left" ref={placeBoxRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Geographic Region</span>
              </label>
              {selectedPlace && (
                <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                  {selectedPlace.place_type_name || 'Place'}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Assam, Western Ghats, Kerala..."
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  setSelectedPlace(null);
                }}
                onFocus={() => {
                  if (placeResults.length > 0) setShowPlaceDropdown(true);
                }}
                className={`w-full pl-3 pr-8 py-2 rounded-lg border text-xs sm:text-sm transition-colors outline-none ${
                  selectedPlace
                    ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 text-stone-900 dark:text-stone-100 font-medium'
                    : 'border-stone-300 dark:border-stone-700 focus:border-emerald-700 dark:focus:border-emerald-500 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400'
                }`}
              />

              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {isPlaceLoading && <Loader2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 animate-spin" />}
                {selectedPlace ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceQuery('');
                    }}
                    className="p-0.5 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title="Clear region selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
            </div>

            {/* Place Autocomplete Dropdown */}
            {showPlaceDropdown && placeResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white dark:bg-stone-850 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {placeResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlace(p);
                      setPlaceQuery(p.display_name || p.name);
                      setShowPlaceDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between transition-colors text-xs cursor-pointer"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {p.display_name || p.name}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        {p.place_type_name ? `${p.place_type_name} • ` : ''}ID: {p.id}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Centralized Primary Action */}
        <div className="pt-1 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || (!selectedTaxon && !selectedPlace)}
            className={`w-full sm:w-auto min-w-[240px] py-2.5 px-6 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
              isLoading || (!selectedTaxon && !selectedPlace)
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed border border-stone-200 dark:border-stone-750'
                : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {fetchProgress
                    ? `Loading page ${fetchProgress.page} of ${fetchProgress.totalPages}...`
                    : 'Querying iNaturalist...'}
                </span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>
                  {limit === 'all' ? 'Fetch Full Species Checklist' : `Fetch ${limit} Species Observations`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Query Controls Sub-bar */}
        <div className="pt-3 border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-600 dark:text-stone-400">
          {/* Species Count Limit */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Records:</span>
            <select
              value={limit}
              onChange={(e) => {
                const val = e.target.value;
                setLimit(val === 'all' ? 'all' : Number(val));
              }}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value={12}>12 species (Sample)</option>
              <option value={24}>24 species (Standard)</option>
              <option value={48}>48 species (Extended)</option>
              <option value={100}>100 species (Bioblitz)</option>
              <option value={150}>150 species (Pocket Guide)</option>
              <option value={250}>250 species (Broad catalog)</option>
              <option value={500}>500 species (Full batch)</option>
              <option value="all">All Species (Full Checklist)</option>
            </select>
          </div>

          {/* License Filter */}
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">License:</span>
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="open">Open Documentation (CC & Public Domain)</option>
              <option value="commercial">Commercial Reusable (CC0, CC-BY, CC-BY-SA)</option>
              <option value="public_domain">Public Domain Only (CC0)</option>
              <option value="all">All Records (including copyrighted)</option>
            </select>
          </div>

          {/* Curated regional presets toggle */}
          <button
            type="button"
            onClick={() => setShowPresets((v) => !v)}
            className="text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showPresets ? 'Hide presets' : 'Regional presets'}</span>
            {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Regional Presets Row */}
        {showPresets && (
          <div className="pt-2.5 pb-1 border-t border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center gap-1.5 flex-wrap">
            {PRESETS.map((p) => {
              const isActive =
                selectedPlace?.id === p.place.id && selectedTaxon?.id === p.taxon.id;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white border-emerald-800 font-medium'
                      : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                  title={`Query ${p.label}`}
                >
                  {p.tag && (
                    <span className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded border ${
                      isActive
                        ? 'border-white/30 text-emerald-100'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 bg-white/60 dark:bg-stone-900'
                    }`}>
                      {p.tag}
                    </span>
                  )}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Progress Bar for multi-page batch */}
        {isLoading && fetchProgress && (
          <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 animate-spin shrink-0" />
              <span>
                Loading species: <strong>{fetchProgress.current}</strong> of {fetchProgress.total} records
                <span className="text-stone-500 dark:text-stone-400 ml-1 font-mono text-[11px]">
                  (Page {fetchProgress.page}/{fetchProgress.totalPages})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <div className="w-24 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-700 dark:bg-emerald-500 h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((fetchProgress.current / Math.max(1, fetchProgress.total)) * 100)
                    )}%`,
                  }}
                />
              </div>

              {onCancelFetch && (
                <button
                  type="button"
                  onClick={onCancelFetch}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}