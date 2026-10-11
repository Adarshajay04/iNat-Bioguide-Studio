import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Feather, Sparkles, Filter, Check, X, Loader2, ShieldCheck, Globe } from 'lucide-react';
import { searchTaxa, searchPlaces, PRESETS } from '../services/inaturalist';

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
  const [taxonQuery, setTaxonQuery] = useState(selectedTaxon?.preferred_common_name || selectedTaxon?.name || '');
  const [taxonResults, setTaxonResults] = useState([]);
  const [isTaxonLoading, setIsTaxonLoading] = useState(false);
  const [showTaxonDropdown, setShowTaxonDropdown] = useState(false);

  // Place autocomplete state
  const [placeQuery, setPlaceQuery] = useState(selectedPlace?.display_name || selectedPlace?.name || '');
  const [placeResults, setPlaceResults] = useState([]);
  const [isPlaceLoading, setIsPlaceLoading] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  const taxonBoxRef = useRef(null);
  const placeBoxRef = useRef(null);

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
    setTaxonQuery(preset.taxon.preferred_common_name || preset.taxon.name);
    setSelectedPlace(preset.place);
    setPlaceQuery(preset.place.display_name || preset.place.name);
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-8 no-print">
      {/* Header & Preset Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Select Taxa & Geographic Region</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Query live observations from over 200+ million global naturalist records
          </p>
        </div>

        {/* Popular Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            Quick Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300 transition-colors"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
          {/* Taxon Autocomplete Input */}
          <div className="lg:col-span-5 relative" ref={taxonBoxRef}>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-emerald-600" />
                Taxon (Species, Family, Class)
              </span>
              {selectedTaxon && (
                <span className="text-[11px] font-normal text-emerald-600 lowercase bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {selectedTaxon.rank || 'taxon'}
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Birds (Aves), Butterflies, Oak trees, Fungi..."
                value={taxonQuery}
                onChange={(e) => {
                  setTaxonQuery(e.target.value);
                  setSelectedTaxon(null);
                }}
                onFocus={() => {
                  if (taxonResults.length > 0) setShowTaxonDropdown(true);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  selectedTaxon
                    ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 font-medium'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 bg-white'
                }`}
              />

              <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                {isTaxonLoading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
                {selectedTaxon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(null);
                      setTaxonQuery('');
                    }}
                    className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Taxon Autocomplete Dropdown */}
            {showTaxonDropdown && taxonResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {taxonResults.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaxon(t);
                      setTaxonQuery(t.preferred_common_name || t.name);
                      setShowTaxonDropdown(false);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-emerald-50/60 flex items-center justify-between transition-colors text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {t.default_photo ? (
                        <img
                          src={t.default_photo.square_url}
                          alt={t.name}
                          className="w-7 h-7 rounded-md object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          🌿
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 truncate">
                          {t.preferred_common_name || t.name}
                        </div>
                        <div className="text-[11px] text-slate-400 italic truncate">
                          {t.name} • {t.rank}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Place Autocomplete Input */}
          <div className="lg:col-span-4 relative" ref={placeBoxRef}>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Place / Location
              </span>
              {selectedPlace && (
                <span className="text-[11px] font-normal text-emerald-600 lowercase bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {selectedPlace.place_type_name || 'location'}
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. California, Costa Rica, Kruger National Park..."
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  setSelectedPlace(null);
                }}
                onFocus={() => {
                  if (placeResults.length > 0) setShowPlaceDropdown(true);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  selectedPlace
                    ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 font-medium'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 bg-white'
                }`}
              />

              <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                {isPlaceLoading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
                {selectedPlace ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceQuery('');
                    }}
                    className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Place Autocomplete Dropdown */}
            {showPlaceDropdown && placeResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {placeResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlace(p);
                      setPlaceQuery(p.display_name || p.name);
                      setShowPlaceDropdown(false);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-emerald-50/60 flex items-center justify-between transition-colors text-xs sm:text-sm"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {p.display_name || p.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.place_type_name ? `${p.place_type_name} • ` : ''}ID: {p.id}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger Button */}
          <div className="lg:col-span-3 pt-6 sm:pt-6">
            <button
              type="submit"
              disabled={isLoading || (!selectedTaxon && !selectedPlace)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                isLoading || (!selectedTaxon && !selectedPlace)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {fetchProgress
                      ? `Fetching p.${fetchProgress.page}/${fetchProgress.totalPages}...`
                      : 'Fetching Species...'}
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
        </div>

        {/* Secondary Filters Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Image License Filter */}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Image License:</span>
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="open">Open Reusable (CC & Public Domain) — Recommended</option>
                <option value="commercial">Commercial Reusable (CC0, CC-BY, CC-BY-SA)</option>
                <option value="public_domain">Public Domain Only (CC0)</option>
                <option value="all">All Licenses (including copyrighted)</option>
              </select>
            </div>

            {/* Species Count Limit Selector - WITH ALL SPECIES OPTION */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Species to fetch:</span>
              <select
                value={limit}
                onChange={(e) => {
                  const val = e.target.value;
                  setLimit(val === 'all' ? 'all' : Number(val));
                }}
                className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none ${
                  limit === 'all'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value={12}>12 species (Quick sample)</option>
                <option value={24}>24 species (Standard)</option>
                <option value={48}>48 species (Extended)</option>
                <option value={100}>100 species (Large Bioblitz)</option>
                <option value={250}>250 species (Exhaustive)</option>
                <option value={500}>500 species (Full Batch)</option>
                <option value="all">✨ All Species (Complete Regional Checklist)</option>
              </select>

              {limit === 'all' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  Full Catalog
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            Filters verified research observations with open license photos
          </div>
        </div>

        {/* Live Multi-page Batch Fetch Progress Banner */}
        {isLoading && fetchProgress && (
          <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 animate-in fade-in">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Loader2 className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
              <div>
                <span className="font-bold">
                  Fetching All Species: {fetchProgress.current} of {fetchProgress.total} loaded
                </span>
                <span className="text-emerald-700 ml-1.5 text-[11px]">
                  (Page {fetchProgress.page} of {fetchProgress.totalPages})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Mini progress bar */}
              <div className="w-32 bg-emerald-200/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
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
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-emerald-300 rounded-md hover:bg-emerald-100 text-emerald-800 transition-colors"
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
