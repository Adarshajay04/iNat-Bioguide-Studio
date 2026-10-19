import { toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

// 1x1 transparent PNG fallback data URL
const FALLBACK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Triggers standard browser print dialog.
 * 100% reliable vector print across all browsers.
 */
export function triggerBrowserPrint() {
  window.print();
}

/**
 * Ensures any images that might lack CORS headers are proxied through weserv
 * and configured with crossOrigin="anonymous".
 */
export function sanitizeImageUrls(container) {
  if (!container) return;
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    img.crossOrigin = 'anonymous';
    const src = img.getAttribute('src') || img.src;
    if (
      src &&
      !src.startsWith('data:') &&
      !src.startsWith('blob:') &&
      !src.includes('images.weserv.nl')
    ) {
      img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
    }
  });
}

/**
 * Asynchronously waits until all <img> tags inside a container have finished loading.
 * Prevents blank images in exports caused by premature captures.
 */
export async function waitForAllImages(container, timeoutMs = 6000) {
  if (!container) return;
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) return;

  const loadPromises = images.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let settled = false;
      const onDone = () => {
        if (!settled) {
          settled = true;
          img.removeEventListener('load', onDone);
          img.removeEventListener('error', onDone);
          resolve();
        }
      };
      img.addEventListener('load', onDone);
      img.addEventListener('error', onDone);
      setTimeout(onDone, timeoutMs);
    });
  });

  await Promise.all(loadPromises);
}

/**
 * Inlines all already-loaded images as Base64 Data URLs directly onto the DOM element.
 * This completely eliminates html-to-image network fetches, rate limits, and 404s!
 */
export function inlineLoadedImagesAsDataUrls(container) {
  if (!container) return;
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (img.src && img.src.startsWith('data:')) return;
    if (img.complete && img.naturalWidth > 0) {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.naturalWidth;
        offCanvas.height = img.naturalHeight;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.96);
        if (dataUrl && dataUrl.length > 200) {
          img.src = dataUrl;
        }
      } catch (err) {
        // Fall back to original proxied URL if canvas is tainted
        console.warn('Canvas inlining fallback for image:', err);
      }
    }
  });
}

/**
 * Safely loads an SVG data URL into an Image element without Chromium decode/CORS bugs.
 */
function loadSvgImage(svgDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to rasterize SVG into image.'));
    img.src = svgDataUrl;
  });
}

/**
 * Converts a DOM element to an HTMLCanvasElement with full oklch & modern CSS support
 */
export async function elementToCanvas(element, scale = 1.5, overrideStyles = {}) {
  if (!element) throw new Error('Target export container was not found in document.');

  // Pre-sanitize any images to guarantee CORS compliance
  sanitizeImageUrls(element);
  await waitForAllImages(element, 4000);
  inlineLoadedImagesAsDataUrls(element);

  // Convert element to SVG data URL using html-to-image
  // fontEmbedCSS: '' completely skips external stylesheet fetching (avoids Google Fonts CSSRule errors)
  const svgDataUrl = await toSvg(element, {
    fontEmbedCSS: '',
    imagePlaceholder: FALLBACK_PIXEL,
    onImageErrorHandler: () => FALLBACK_PIXEL,
    cacheBust: false,
    skipAutoScale: true,
    style: overrideStyles,
    filter: (node) => {
      // Always include the root container itself
      if (node === element) return true;
      if (node.nodeType === 1) { // Element node
        const tag = (node.tagName || '').toLowerCase();
        // Interactive UI buttons must NEVER appear in the PDF export
        if (tag === 'button') {
          return false;
        }
        if (
          node.classList?.contains('no-print') ||
          node.classList?.contains('export-ignore') ||
          node.getAttribute?.('data-export-ignore') === 'true'
        ) {
          return false;
        }
      }
      return true;
    },
  });

  // Load SVG into an Image element safely
  const img = await loadSvgImage(svgDataUrl);

  // Draw to offscreen canvas
  const width = element.offsetWidth || 800;
  const height = element.offsetHeight || 600;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * Captures an HTML element and saves it as a downloadable image (PNG)
 */
export async function downloadElementAsPng(elementId, fileName = 'inat-poster.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await elementToCanvas(element, 1.5);
  const dataUrl = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

/**
 * Captures an HTML element and converts it to a downloadable PDF file.
 * Multi-page aware: processes each `.pdf-page` element independently so no cards
 * or images are ever cut in half across page boundaries.
 */
export async function downloadElementAsPdf(
  elementId,
  fileName = 'inat-guide.pdf',
  orientation = 'portrait',
  onProgress = null,
  scale = 2.5
) {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // 1. Sanitize, wait for images to load, and inline as data URLs
  if (onProgress) onProgress({ status: 'loading-images', page: 0, total: 1 });
  sanitizeImageUrls(container);
  await waitForAllImages(container, 5000);
  inlineLoadedImagesAsDataUrls(container);

  // 2. Discover .pdf-page elements
  let pageNodes = Array.from(container.querySelectorAll('.pdf-page'));
  if (pageNodes.length === 0 && container.classList.contains('pdf-page')) {
    pageNodes = [container];
  }
  if (pageNodes.length === 0) {
    pageNodes = [container];
  }

  let pdf = null;
  const totalPages = pageNodes.length;

  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageNodes[i];
    if (onProgress) {
      onProgress({ status: 'rendering-page', page: i + 1, total: totalPages });
    }

    const customW = parseFloat(pageEl.getAttribute('data-pdf-width-mm'));
    const customH = parseFloat(pageEl.getAttribute('data-pdf-height-mm'));
    const curW = customW || (orientation === 'landscape' ? 297 : 210);
    const curH = customH || (orientation === 'landscape' ? 210 : 297);
    const curOrient = curW >= curH ? 'landscape' : 'portrait';

    if (i === 0) {
      pdf = new jsPDF({
        orientation: curOrient,
        unit: 'mm',
        format: [curW, curH],
        compress: true,
      });
    } else {
      pdf.addPage([curW, curH], curOrient);
    }

    // Capture individual page at high DPI without outer shadow, rounded corners or border
    const canvas = await elementToCanvas(pageEl, scale, {
      borderRadius: '0px',
      boxShadow: 'none',
      border: 'none',
      margin: '0px',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    const canvasAspect = canvas.width / canvas.height;
    const pageAspect = curW / curH;

    // If aspect ratios match closely, fill page completely
    if (Math.abs(canvasAspect - pageAspect) < 0.15) {
      pdf.addImage(imgData, 'JPEG', 0, 0, curW, curH, undefined, 'SLOW');
    } else {
      // Proportional fit centered on page (e.g. posters or custom aspects)
      let drawW = curW;
      let drawH = curH;
      let offX = 0;
      let offY = 0;

      if (canvasAspect > pageAspect) {
        drawW = curW;
        drawH = curW / canvasAspect;
        offY = Math.max(0, (curH - drawH) / 2);
      } else {
        drawH = curH;
        drawW = curH * canvasAspect;
        offX = Math.max(0, (curW - drawW) / 2);
      }

      pdf.addImage(imgData, 'JPEG', offX, offY, drawW, drawH, undefined, 'SLOW');
    }
  }

  if (onProgress) onProgress({ status: 'saving', page: totalPages, total: totalPages });
  pdf.save(fileName);
}
