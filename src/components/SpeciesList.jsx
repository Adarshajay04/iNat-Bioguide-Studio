import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  Printer,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
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
  isLoading,
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

  if (species.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl">
          🌿
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Species Loaded Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Use the search bar above to choose a Taxon and a Place, or click one of the quick presets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Main Toolbar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
        {/* Row 1: Statistics and Fetch All Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{species.length.toLocaleString()} Species Loaded</span>
              {totalResults > species.length && (
                <span className="text-xs font-normal text-slate-400">
                  (of {totalResults.toLocaleString()} recorded in {selectedPlace?.display_name || selectedPlace?.name || 'region'})
                </span>
              )}
            </div>

            {/* Direct 1-Click "Fetch All Species" Button if partial results loaded */}
            {totalResults > species.length && onFetchAllSpecies && (
              <button
                type="button"
                onClick={onFetchAllSpecies}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors shadow-2xs"
                title="Fetch all verified species for this region"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>Fetch All {totalResults.toLocaleString()} Species</span>
              </button>
            )}
          </div>

          {/* Quick Selection Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">
              Select:
            </span>
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {isAllSelected ? 'Deselect All' : `All (${species.length})`}
            </button>

            {species.length > 24 && onSelectTopN && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTopN(24)}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Top 24
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTopN(48)}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Top 48
                </button>
              </>
            )}

            {species.length > 100 && onSelectTopN && (
              <button
                type="button"
                onClick={() => onSelectTopN(100)}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Top 100
              </button>
            )}

            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 ml-1">
              {selectedCount.toLocaleString()} Selected
            </span>
          </div>
        </div>

        {/* Row 2: Filter input, View Mode Switcher, and Export CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search within loaded list */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search within ${species.length} species...`}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* View Mode Switcher (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-xs text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Photo Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white shadow-xs text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dense Checklist Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Export CTA Button */}
          <button
            type="button"
            onClick={onOpenExport}
            disabled={selectedCount === 0}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
              selectedCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Generate Exports ({selectedCount.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main List Rendering */}
      {viewMode === 'grid' ? (
        /* Visual Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
        /* High-Density Checklist Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={isAllSelected ? onDeselectAll : onSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3 px-3 w-16">Photo</th>
                  <th className="py-3 px-4">Common Name</th>
                  <th className="py-3 px-4">Scientific Name</th>
                  <th className="py-3 px-4">Taxon Rank</th>
                  <th className="py-3 px-4 text-right">Observations</th>
                  <th className="py-3 px-4 text-center">External</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSpecies.map((s, index) => {
                  const isChecked = selectedIds.has(s.id);
                  const photo = s.photo;
                  const thumbUrl = photo?.squareUrl || photo?.mediumUrl;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(s.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={s.commonName}
                            crossOrigin="anonymous"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            🌿
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {s.commonName}
                      </td>
                      <td className="py-2.5 px-4 italic text-slate-600 font-serif">
                        {s.scientificName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {s.iconicTaxon || s.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                        {s.count?.toLocaleString()} obs
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <a
                          href={`https://www.inaturalist.org/taxa/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-emerald-600 inline-flex items-center gap-1"
                          title="View on iNaturalist"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Show per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === 'all' ? 'all' : Number(val));
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:outline-none"
            >
              <option value={24}>24 species</option>
              <option value={48}>48 species</option>
              <option value={96}>96 species</option>
              <option value="all">Show All ({filteredSpecies.length})</option>
            </select>
            <span className="text-slate-400 ml-2">
              Showing {startIndex + 1}–
              {Math.min(startIndex + paginatedSpecies.length, filteredSpecies.length)} of{' '}
              {filteredSpecies.length.toLocaleString()}
            </span>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {filteredSpecies.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No species found matching "{filterText}".
        </div>
      )}
    </div>
  );
}
