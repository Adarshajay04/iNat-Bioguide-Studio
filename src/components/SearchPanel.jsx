import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Feather, Sparkles, X, Loader2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Hidden presets toggle (hidden by default for minimal, uncluttered view)
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
    }, 300);
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
    }, 300);
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
    <div className="max-w-3xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 mb-6 no-print transition-colors duration-200">
      {/* Centralized Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Step 1 • Select Taxa & Geographic Region</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Regional Biodiversity
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Choose a species group and Indian region to explore verified field observations
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Centralized Inputs (Side by Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Taxon Autocomplete Input */}
          <div className="relative text-left" ref={taxonBoxRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Taxon / Species Group</span>
              </label>
              {selectedTaxon && (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200/70 dark:border-emerald-800/60">
                  {selectedTaxon.rank || 'Taxon'}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Birds (Aves), Butterflies, Plants..."
                value={taxonQuery}
                onChange={(e) => {
                  setTaxonQuery(e.target.value);
                  setSelectedTaxon(null);
                }}
                onFocus={() => {
                  if (taxonResults.length > 0) setShowTaxonDropdown(true);
                }}
                className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  selectedTaxon
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-semibold'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400'
                }`}
              />

              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {isTaxonLoading && <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />}
                {selectedTaxon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(null);
                      setTaxonQuery('');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Taxon Autocomplete Dropdown */}
            {showTaxonDropdown && taxonResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                {taxonResults.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(t);
                      setTaxonQuery(t.preferred_common_name || t.name);
                      setShowTaxonDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors text-xs sm:text-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {t.default_photo ? (
                        <img
                          src={toCorsSafeUrl(t.default_photo.square_url)}
                          alt={t.name}
                          crossOrigin="anonymous"
                          className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                          🌿
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {t.preferred_common_name || t.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-400 italic truncate">
                          {t.name} {t.rank ? `• ${t.rank}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Geographic Region / Place</span>
              </label>
              {selectedPlace && (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200/70 dark:border-emerald-800/60">
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
                className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  selectedPlace
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-semibold'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400'
                }`}
              />

              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {isPlaceLoading && <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />}
                {selectedPlace ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceQuery('');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Place Autocomplete Dropdown */}
            {showPlaceDropdown && placeResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                {placeResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlace(p);
                      setPlaceQuery(p.display_name || p.name);
                      setShowPlaceDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors text-xs sm:text-sm cursor-pointer"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {p.display_name || p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400">
                        {p.place_type_name ? `${p.place_type_name} • ` : ''}ID: {p.id}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Centralized Primary Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || (!selectedTaxon && !selectedPlace)}
            className={`w-full sm:w-auto min-w-[260px] py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isLoading || (!selectedTaxon && !selectedPlace)
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {fetchProgress
                    ? `Fetching p.${fetchProgress.page}/${fetchProgress.totalPages}...`
                    : 'Fetching Observations...'}
                </span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>
                  {limit === 'all' ? 'Fetch All Species' : `Fetch ${limit} Species`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Centralized Secondary Options Bar (Compact & Minimalist) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          {/* Species Count Limit */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Batch Limit:</span>
            <select
              value={limit}
              onChange={(e) => {
                const val = e.target.value;
                setLimit(val === 'all' ? 'all' : Number(val));
              }}
              className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none transition-colors ${
                limit === 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <option value={12}>12 species (Quick sample)</option>
              <option value={24}>24 species (Standard)</option>
              <option value={48}>48 species (Extended)</option>
              <option value={100}>100 species (Large bioblitz)</option>
              <option value={150}>150 species (12-Panel Pocket Guide)</option>
              <option value={250}>250 species (Exhaustive)</option>
              <option value={500}>500 species (Full batch)</option>
              <option value="all">✨ All Species (Full checklist)</option>
            </select>
          </div>

          {/* License Filter */}
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">License:</span>
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="open">Open Reusable (CC & Public Domain)</option>
              <option value="commercial">Commercial Reusable (CC0, CC-BY, CC-BY-SA)</option>
              <option value="public_domain">Public Domain Only (CC0)</option>
              <option value="all">All Licenses (including copyrighted)</option>
            </select>
          </div>

          {/* Collapsed Presets Toggle (Presets hidden by default) */}
          <button
            type="button"
            onClick={() => setShowPresets((v) => !v)}
            className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showPresets ? 'Hide presets' : 'Show presets'}</span>
            {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Hidden Regional Presets (Rendered only when user expands) */}
        {showPresets && (
          <div className="pt-3 pb-1 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 flex-wrap animate-in fade-in duration-200">
            {PRESETS.map((p) => {
              const isActive =
                selectedPlace?.id === p.place.id && selectedTaxon?.id === p.taxon.id;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700'
                  }`}
                  title={`Quick load ${p.label}`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Live Multi-page Batch Fetch Progress Banner */}
        {isLoading && fetchProgress && (
          <div className="mt-4 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Loader2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-spin shrink-0" />
              <div>
                <span className="font-bold">
                  Fetching All Species: {fetchProgress.current} of {fetchProgress.total} loaded
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 ml-1.5 text-[11px]">
                  (Page {fetchProgress.page} of {fetchProgress.totalPages})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="w-32 bg-emerald-200/80 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-full transition-all duration-300"
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
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-md hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                >
                  Stop & Keep Loaded
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}