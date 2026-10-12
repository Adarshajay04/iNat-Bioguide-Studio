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
} from 'lucide-react';
import FieldGuideView from './FieldGuideView';
import PamphletView from './PamphletView';
import PosterView from './PosterView';
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
  onOpenSettings,
}) {
  const [activeTab, setActiveTab] = useState('field-guide'); // 'field-guide' | 'pamphlet' | 'poster'
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  if (!isOpen) return null;

  const getContainerId = () => {
    switch (activeTab) {
      case 'field-guide':
        return 'field-guide-export-container';
      case 'pamphlet':
        return 'pamphlet-export-container';
      case 'poster':
        return 'poster-export-container';
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
      const orientation = activeTab === 'pamphlet' ? 'landscape' : 'portrait';

      await downloadElementAsPdf(containerId, filename, orientation, (prog) => {
        if (prog.status === 'loading-images') {
          setExportProgress('Checking photos...');
        } else if (prog.status === 'rendering-page') {
          setExportProgress(`Page ${prog.page}/${prog.total}`);
        } else if (prog.status === 'saving') {
          setExportProgress('Saving PDF...');
        }
      });
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md overflow-y-auto flex flex-col print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
      {/* Modal Fixed Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm no-print">
        {/* Tab Selection */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('field-guide')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'field-guide'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Field Guide (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pamphlet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pamphlet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tri-fold Pamphlet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'poster'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Wall Poster</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Adjust photo names and copyright overlays"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Adjust Overlays</span>
          </button>

          {/* Native Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
            title="Open browser print dialog to save as crisp vector PDF or print"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          {/* Direct PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors"
            title="Download direct PDF file"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="text-emerald-300 font-mono text-xs">{exportProgress || 'Generating...'}</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              title="Download high-res PNG image"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">PNG Image</span>
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            title="Close export preview"
          >
            <X className="w-5 h-5" />
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
          />
        )}

        {activeTab === 'pamphlet' && (
          <PamphletView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="pamphlet-export-container"
          />
        )}

        {activeTab === 'poster' && (
          <PosterView
            species={species}
            placeName={placeName}
            taxonName={taxonName}
            overlaySettings={overlaySettings}
            id="poster-export-container"
          />
        )}
      </div>
    </div>
  );
}
