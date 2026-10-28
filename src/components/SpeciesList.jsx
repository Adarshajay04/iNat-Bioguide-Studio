import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  Printer,
  ArrowRight,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Database,
  Loader2,
} from 'lucide-react';
import SpeciesCard from './SpeciesCard';

export default function SpeciesList({
  species,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onSelectTopN,
  onOpenExport,
  overlaySettings,
  totalResults,
  selectedPlace,
  selectedTaxon,
  onFetchAllSpecies,
  onFetchCommonSpecies,
  onTriggerFetch,
  isLoading,
  hasFetched = false,
  onChangePhoto,
  loadingPhotoSpeciesId,
}) {
  const [filterText, setFilterText] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [pageSize, setPageSize] = useState(48); // 24 | 48 | 96 | 'all'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter species by query string
  const filteredSpecies = useMemo(() => {
    if (!filterText.trim()) return species;
    const q = filterText.toLowerCase();
    return species.filter(
      (s) =>
        s.commonName?.toLowerCase().includes(q) ||
        s.scientificName?.toLowerCase().includes(q) ||
        s.iconicTaxon?.toLowerCase().includes(q)
    );
  }, [species, filterText]);

  // Reset to page 1 when filter or pageSize changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterText, pageSize]);

  // Pagination calculation
  const effectivePageSize = pageSize === 'all' ? filteredSpecies.length : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredSpecies.length / (effectivePageSize || 1)));
  const startIndex = (currentPage - 1) * effectivePageSize;
  const paginatedSpecies =
    pageSize === 'all'
      ? filteredSpecies
      : filteredSpecies.slice(startIndex, startIndex + effectivePageSize);

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === species.length && species.length > 0;

  const taxonDisplayName = selectedTaxon?.preferred_common_name || selectedTaxon?.name || 'Birds';
  const placeDisplayName = selectedPlace?.display_name || selectedPlace?.name || 'Assam, IN';

  // State 1: Clean Minimalist Landing View before user clicks "Fetch"
  if (!hasFetched && !isLoading && species.length === 0) {
    return null;
  }

  // State 2: Loading initial fetch
  if (isLoading && species.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center my-6 max-w-sm mx-auto shadow-xs transition-colors duration-200">
        <Loader2 className="w-6 h-6 text-emerald-800 dark:text-emerald-400 animate-spin mx-auto mb-3" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
          Querying iNaturalist Database
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Retrieving observation checklist for {taxonDisplayName} in {placeDisplayName}...
        </p>
      </div>
    );
  }

  // State 3: Fetched but 0 results found
  if (hasFetched && species.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 p-8 text-center my-6 max-w-md mx-auto transition-colors duration-200">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
          No Verified Observations Found
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-3">
          No research-grade observations with open license photography were recorded for {taxonDisplayName} in {placeDisplayName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Naturalist Checklist Console Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 sm:p-4 flex flex-col gap-3 shadow-xs transition-colors duration-200">
        {/* Row 1: Observation Statistics & Selection Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>{species.length.toLocaleString()} Species Cataloged</span>
              {totalResults > species.length && (
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400 font-mono">
                  ({totalResults.toLocaleString()} total records in {selectedPlace?.name || 'region'})
                </span>
              )}
            </div>

            {totalResults > species.length && onFetchAllSpecies && (
              <button
                type="button"
                onClick={onFetchAllSpecies}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                title="Fetch all verified observations for this region"
              >
                <Database className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                <span>Fetch All ({totalResults.toLocaleString()})</span>
              </button>
            )}
          </div>

          {/* Quick Selection Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-stone-500 font-mono">Select:</span>
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            >
              {isAllSelected ? 'Deselect' : `All (${species.length})`}
            </button>

            {species.length > 24 && onSelectTopN && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTopN(24)}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                >
                  Top 24
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTopN(48)}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                >
                  Top 48
                </button>
              </>
            )}

            {species.length >= 130 && onSelectTopN && (
              <button
                type="button"
                onClick={() => onSelectTopN(150)}
                className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                title="Select top 150 species for 12-panel pocket guide"
              >
                Top 150 (Pocket Guide)
              </button>
            )}

            <span className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 ml-1">
              {selectedCount.toLocaleString()} selected
            </span>
          </div>
        </div>

        {/* Row 2: Search Filter, View Mode, and Export Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search within loaded list */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={`Filter loaded species...`}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-emerald-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-white placeholder-stone-400"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Visual Specimen Plates (Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Dense Checklist Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Export CTA Button */}
          <button
            type="button"
            onClick={onOpenExport}
            disabled={selectedCount === 0}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
              selectedCount > 0
                ? 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed border border-stone-200 dark:border-stone-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Publication & Print Dialog ({selectedCount.toLocaleString()})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main List Rendering */}
      {viewMode === 'grid' ? (
        /* Visual Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedSpecies.map((s) => (
            <SpeciesCard
              key={s.id}
              species={s}
              isSelected={selectedIds.has(s.id)}
              onToggleSelect={onToggleSelect}
              overlaySettings={overlaySettings}
              onChangePhoto={onChangePhoto}
              loadingPhotoSpeciesId={loadingPhotoSpeciesId}
            />
          ))}
        </div>
      ) : (
        /* Dense Checklist Table View */
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={isAllSelected ? onDeselectAll : onSelectAll}
                      className="rounded text-emerald-800 focus:ring-emerald-700"
                    />
                  </th>
                  <th className="py-2.5 px-2.5 w-12">Specimen</th>
                  <th className="py-2.5 px-3">Common Name</th>
                  <th className="py-2.5 px-3">Scientific Name</th>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3 text-right">Observations</th>
                  <th className="py-2.5 px-3 text-center">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {paginatedSpecies.map((s) => {
                  const isChecked = selectedIds.has(s.id);
                  const photo = s.photo;
                  const thumbUrl = photo?.squareUrl || photo?.mediumUrl;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-stone-50/80 dark:hover:bg-stone-850/60 transition-colors ${
                        isChecked ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(s.id)}
                          className="rounded text-emerald-800 focus:ring-emerald-700"
                        />
                      </td>
                      <td className="py-2 px-2.5">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={s.commonName}
                            crossOrigin="anonymous"
                            className="w-8 h-8 rounded object-cover border border-stone-200 dark:border-stone-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 text-xs">
                            🌿
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-stone-900 dark:text-stone-100">
                        {s.commonName}
                      </td>
                      <td className="py-2 px-3 italic text-stone-600 dark:text-stone-400 font-serif">
                        {s.scientificName}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                          {s.iconicTaxon || s.rank}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-stone-600 dark:text-stone-400">
                        {s.count?.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <a
                          href={`https://www.inaturalist.org/taxa/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex items-center gap-1 font-mono text-[10px]"
                          title="View on iNaturalist"
                        >
                          <span>#{s.id}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls Bar */}
      {filteredSpecies.length > 24 && (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-stone-600 dark:text-stone-400 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === 'all' ? 'all' : Number(val));
              }}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-0.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value={24}>24 species</option>
              <option value={48}>48 species</option>
              <option value={96}>96 species</option>
              <option value="all">All ({filteredSpecies.length})</option>
            </select>
            <span className="text-stone-400 font-mono text-[11px] ml-1">
              Showing {startIndex + 1}–{Math.min(startIndex + paginatedSpecies.length, filteredSpecies.length)} of {filteredSpecies.length.toLocaleString()}
            </span>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-stone-200 dark:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-stone-700 dark:text-stone-300">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-stone-200 dark:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {filteredSpecies.length === 0 && (
        <div className="text-center py-8 text-stone-400 text-xs">
          No species found matching "{filterText}".
        </div>
      )}
    </div>
  );
}