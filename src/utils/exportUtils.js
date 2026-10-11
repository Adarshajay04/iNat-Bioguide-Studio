import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Triggers standard browser print dialog.
 * 100% reliable across all domains without CORS restrictions.
 * Produces crisp vector typography and high-res photos.
 */
export function triggerBrowserPrint() {
  window.print();
}

/**
 * Captures an HTML element and saves it as a downloadable image (PNG)
 */
export async function downloadElementAsPng(elementId, fileName = 'inat-poster.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.warn('Canvas export hit CORS boundary:', err);
    throw new Error(
      'Some photographs from iNaturalist restrict third-party canvas downloads. Please use "Print / Save PDF" to save directly with all images!'
    );
  }
}

/**
 * Captures an HTML element and converts it to a downloadable PDF file
 */
export async function downloadElementAsPdf(elementId, fileName = 'inat-guide.pdf', orientation = 'portrait') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgHeight = (canvasHeight * pageWidth) / canvasWidth;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (err) {
    console.warn('Direct PDF canvas failed:', err);
    throw new Error(
      'Notice: Some photographs restrict canvas capture. Please use the "Print / Save PDF" button (Destination: Save as PDF) for complete high-resolution rendering.'
    );
  }
}
