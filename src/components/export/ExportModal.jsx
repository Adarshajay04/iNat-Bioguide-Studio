import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Palette,
  Sliders,
  Loader2,
  Check,
  Layers,
} from 'lucide-react';
import FieldGuideView from './FieldGuideView';
import PamphletView from './PamphletView';
import PosterView from './PosterView';
import PocketGuideView from './PocketGuideView';
import {
  triggerBrowserPrint,
  downloadElementAsPdf,
  downloadElementAsPng,
} from '../../utils/exportUtils';

export default function ExportModal({
  isOpen,
  onClose,
  species,
  placeName,
  taxonName,
  overlaySettings,
  onChangePhoto,
  loadingPhotoSpeciesId,
  onOpenSettings,
  onFetchCommonSpecies,
}) {
  const [activeTab, setActiveTab] = useState('field-guide'); // 'field-guide' | 'pamphlet' | 'poster' | 'pocket-guide'
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [pdfQuality, setPdfQuality] = useState('ultra'); // 'ultra' (2.8x = 300 DPI) | 'high' (2.0x = 200 DPI) | 'standard' (1.5x)

  if (!isOpen) return null;

  const getContainerId = () => {
    switch (activeTab) {
      case 'field-guide':
        return 'field-guide-export-container';
      case 'pamphlet':
        return 'pamphlet-export-container';
      case 'poster':
        return 'poster-export-container';
      case 'pocket-guide':
        return 'pocket-guide-export-container';
      default:
        return 'field-guide-export-container';
    }
  };

  const handlePrint = () => {
    triggerBrowserPrint();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      setExportProgress('Preparing...');
      const containerId = getContainerId();
      const sanitizedName = `${taxonName || 'Species'}_${placeName || 'Guide'}`
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      const filename = `${sanitizedName}_${activeTab}.pdf`;
      const orientation = (activeTab === 'pamphlet' || activeTab === 'pocket-guide') ? 'landscape' : 'portrait';
      const scale = pdfQuality === 'ultra' ? 2.8 : pdfQuality === 'high' ? 2.0 : 1.5;

      await downloadElementAsPdf(
        containerId,
        filename,
        orientation,
        (prog) => {
          if (prog.status === 'loading-images') {
            setExportProgress('Checking photos...');
          } else if (prog.status === 'rendering-page') {
            setExportProgress(`Page ${prog.page}/${prog.total}`);
          } else if (prog.status === 'saving') {
            setExportProgress('Saving PDF...');
          }
        },
        scale
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(`Direct PDF export error: ${err.message || err}\n\nTip: You can use the "Print / Save PDF" button for a 100% crisp vector PDF.`);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handleDownloadPng = async () => {
    try {
      setIsExporting(true);
      const containerId = getContainerId();
      const sanitizedName = `${taxonName || 'Species'}_${placeName || 'Poster'}`
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      const filename = `${sanitizedName}.png`;

      await downloadElementAsPng(containerId, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('PNG export failed:', err);
      alert(`PNG export error: ${err.message || err}\n\nTip: You can use "Print / Save PDF" as an alternative.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs overflow-y-auto flex flex-col print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
      {/* Modal Fixed Top Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-xs no-print transition-colors duration-200">
        {/* Tab Selection */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('field-guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'field-guide'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Field Guide (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pamphlet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'pamphlet'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tri-fold Pamphlet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Wall Poster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pocket-guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'pocket-guide'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pocket Guide (12-Panel)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quality Selector */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-xs">
            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 hidden sm:inline">DPI:</span>
            <select
              value={pdfQuality}
              onChange={(e) => setPdfQuality(e.target.value)}
              className="bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded px-1.5 py-0.5 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              title="Select PDF render resolution"
            >
              <option value="ultra">300 DPI (Press Print)</option>
              <option value="high">200 DPI (Crisp)</option>
              <option value="standard">150 DPI (Screen)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
            title="Adjust photo names and copyright overlays"
          >
            <Sliders className="w-3 h-3 text-stone-500 dark:text-stone-400" />
            <span className="hidden sm:inline">Plate Overlays</span>
          </button>

          {/* Native Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
            title="Open browser print dialog to save as crisp vector PDF or print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          {/* Direct PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors cursor-pointer"
            title="Download direct PDF file"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span className="text-emerald-300 font-mono text-xs">{exportProgress || 'Rendering...'}</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Direct PDF</span>
              </>
            )}
          </button>

          {/* PNG image download for posters */}
          {activeTab === 'poster' && (
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              title="Download high-res PNG image"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden sm:inline">PNG</span>
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ml-1"
            title="Close export viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
        {activeTab === 'field-guide' && (
          <FieldGuideView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="field-guide-export-container"
            onChangePhoto={onChangePhoto}
            loadingPhotoSpeciesId={loadingPhotoSpeciesId}
          />
        )}

        {activeTab === 'pamphlet' && (
          <PamphletView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="pamphlet-export-container"
            onChangePhoto={onChangePhoto}
            loadingPhotoSpeciesId={loadingPhotoSpeciesId}
          />
        )}

        {activeTab === 'poster' && (
          <PosterView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="poster-export-container"
            onChangePhoto={onChangePhoto}
            loadingPhotoSpeciesId={loadingPhotoSpeciesId}
          />
        )}

        {activeTab === 'pocket-guide' && (
          <PocketGuideView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="pocket-guide-export-container"
            onChangePhoto={onChangePhoto}
            loadingPhotoSpeciesId={loadingPhotoSpeciesId}
            onFetchCommonSpecies={onFetchCommonSpecies}
          />
        )}
      </div>
    </div>
  );
}
