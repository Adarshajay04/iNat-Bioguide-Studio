/**
 * iNaturalist API Service
 * Public API endpoints: https://api.inaturalist.org/v1/
 */

const BASE_URL = 'https://api.inaturalist.org/v1';

// Make image URL CORS-safe for canvas/PDF capture
export function toCorsSafeUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('images.weserv.nl')) return url;
  // Route all iNaturalist images through weserv proxy to avoid S3 CORS cache collision
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

// Upgrade square image URL to medium or large for crisp printing
export function getOptimizedImageUrl(photo, size = 'large') {
  if (!photo) return null;
  const url = photo.medium_url || photo.url || photo.square_url;
  if (!url) return null;
  
  const upgraded = url.replace(/\/(square|small)\./i, `/${size}.`);
  return toCorsSafeUrl(upgraded);
}

// Clean attribution string and photographer name
export function formatAttribution(photo) {
  if (!photo) return 'Unknown photographer';
  
  if (photo.attribution_name) {
    const license = photo.license_code ? ` (${photo.license_code.toUpperCase()})` : '';
    return `© ${photo.attribution_name}${license}`;
  }
  
  if (photo.attribution) {
    const match = photo.attribution.match(/\(c\)\s*([^,]+)/i);
    const author = match ? match[1].trim() : 'iNaturalist Contributor';
    const license = photo.license_code ? ` (${photo.license_code.toUpperCase()})` : '';
    return `© ${author}${license}`;
  }

  return '© iNaturalist Contributor';
}

export function mapPhotoObject(photo) {
  if (!photo) return null;
  return {
    id: photo.id,
    squareUrl: toCorsSafeUrl(photo.square_url || photo.url),
    mediumUrl: toCorsSafeUrl(photo.medium_url || (photo.url ? photo.url.replace(/\/(square|small)\./i, '/medium.') : null)),
    largeUrl: getOptimizedImageUrl(photo, 'large'),
    originalUrl: getOptimizedImageUrl(photo, 'original'),
    attribution: formatAttribution(photo),
    rawAttribution: photo.attribution,
    licenseCode: photo.license_code,
    photographer: photo.attribution_name || 'Contributor',
  };
}

function mapTaxonSpecies(item) {
  const taxon = item.taxon || {};
  const photo = taxon.default_photo;
  
  return {
    id: taxon.id,
    count: item.count,
    scientificName: taxon.name,
    commonName: taxon.preferred_common_name || taxon.name,
    rank: taxon.rank || 'species',
    iconicTaxon: taxon.iconic_taxon_name || 'Life',
    wikipediaUrl: taxon.wikipedia_url,
    photo: mapPhotoObject(photo),
    photoIndex: 0,
    photosList: photo ? [mapPhotoObject(photo)] : [],
  };
}

/**
 * Fetch alternative photos for a specific taxon.
 * Returns up to 12 curated community photos so the user can choose one with better visibility.
 */
export async function fetchTaxonPhotos(taxonId) {
  if (!taxonId) return [];

  // 1. Try curated taxon photos from /taxa/{id}
  try {
    const res = await fetch(`${BASE_URL}/taxa/${taxonId}`, {
      headers: { 'User-Agent': 'BioGuideStudio/1.0' },
    });
    if (res.ok) {
      const data = await res.json();
      const taxonPhotos = data.results?.[0]?.taxon_photos || [];
      if (taxonPhotos.length > 0) {
        return taxonPhotos.map((tp) => mapPhotoObject(tp.photo)).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Could not fetch curated taxa photos, trying observations fallback:', err);
  }

  // 2. Fallback: Fetch photos from research grade observations
  try {
    const res = await fetch(
      `${BASE_URL}/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&per_page=12`,
      { headers: { 'User-Agent': 'BioGuideStudio/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const photos = [];
      (data.results || []).forEach((obs) => {
        (obs.photos || []).forEach((p) => {
          photos.push(mapPhotoObject(p));
        });
      });
      return photos.filter(Boolean);
    }
  } catch (err) {
    console.error('Failed to fetch observation photos:', err);
  }

  return [];
}

/**
 * Autocomplete Taxa
 */
export async function searchTaxa(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${BASE_URL}/taxa/autocomplete?q=${encodeURIComponent(query)}&per_page=10`);
    if (!res.ok) throw new Error(`Taxa search failed: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching taxa:', error);
    return [];
  }
}

/**
 * Autocomplete Places
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${BASE_URL}/places/autocomplete?q=${encodeURIComponent(query)}&per_page=10`);
    if (!res.ok) throw new Error(`Places search failed: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

/**
 * Fetch species for taxon + place with full pagination support (including "All Species")
 */
export async function fetchSpeciesCounts({
  placeId,
  taxonId,
  licenseFilter = 'open',
  perPage = 24, // number (e.g. 12..500) or 'all'
  qualityGrade = 'research',
  onProgress = null, // callback({ current, total, page, totalPages })
  abortSignal = null,
}) {
  const isFetchAll = perPage === 'all';
  const targetBatchSize = isFetchAll ? 500 : Math.min(Number(perPage), 500);

  const buildParams = (page = 1, limit = targetBatchSize) => {
    const p = new URLSearchParams({
      has: ['photos'],
      quality_grade: qualityGrade,
      per_page: limit.toString(),
      page: page.toString(),
    });
    if (placeId) p.append('place_id', placeId);
    if (taxonId) p.append('taxon_id', taxonId);
    if (licenseFilter === 'open') {
      p.append('photo_licensed', 'true');
    } else if (licenseFilter === 'commercial') {
      p.append('photo_license', 'cc0,cc-by,cc-by-sa');
    } else if (licenseFilter === 'public_domain') {
      p.append('photo_license', 'cc0');
    }
    return p;
  };

  try {
    // 1. Fetch initial page
    const page1Url = `${BASE_URL}/observations/species_counts?${buildParams(1, targetBatchSize).toString()}`;
    const res1 = await fetch(page1Url, { signal: abortSignal });
    if (!res1.ok) throw new Error(`Species counts failed: ${res1.statusText}`);
    const data1 = await res1.json();

    const totalResults = data1.total_results || 0;
    let allRawResults = [...(data1.results || [])];

    if (onProgress) {
      onProgress({
        current: allRawResults.length,
        total: totalResults,
        page: 1,
        totalPages: Math.ceil(totalResults / targetBatchSize) || 1,
      });
    }

    // 2. If 'all' or perPage > 500, continue fetching subsequent pages
    const targetCount = isFetchAll ? totalResults : Number(perPage);
    const totalPagesNeeded = Math.ceil(Math.min(targetCount, totalResults) / 500);
    const maxPagesToFetch = Math.min(totalPagesNeeded, 20); // Safety limit up to 10,000 species

    if (totalPagesNeeded > 1 && allRawResults.length < targetCount) {
      for (let p = 2; p <= maxPagesToFetch; p++) {
        if (abortSignal?.aborted) break;

        // Polite rate limit buffer (150ms)
        await new Promise((resolve) => setTimeout(resolve, 150));

        const nextUrl = `${BASE_URL}/observations/species_counts?${buildParams(p, 500).toString()}`;
        const nextRes = await fetch(nextUrl, { signal: abortSignal });
        if (!nextRes.ok) break;

        const nextData = await nextRes.json();
        const pageItems = nextData.results || [];
        if (pageItems.length === 0) break;

        allRawResults = allRawResults.concat(pageItems);

        if (onProgress) {
          onProgress({
            current: allRawResults.length,
            total: totalResults,
            page: p,
            totalPages: totalPagesNeeded,
          });
        }

        if (!isFetchAll && allRawResults.length >= Number(perPage)) {
          allRawResults = allRawResults.slice(0, Number(perPage));
          break;
        }
      }
    }

    // Map and sanitize all species
    const species = allRawResults
      .map(mapTaxonSpecies)
      .filter((s) => s.photo !== null);

    return {
      totalResults,
      species,
      fetchedAll: isFetchAll || species.length >= totalResults,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Species fetch aborted by user.');
      throw error;
    }
    console.error('Error fetching species counts:', error);
    throw error;
  }
}

/**
 * Curated presets for instant testing (India & sub-region specific)
 */
export const PRESETS = [
  {
    label: 'Birds of Assam',
    taxon: { id: 3, name: 'Aves', preferred_common_name: 'Birds', rank: 'class' },
    place: { id: 7453, name: 'Assam', display_name: 'Assam, IN', place_type_name: 'State' },
    tag: 'Aves',
  },
  {
    label: 'Birds of Western Ghats',
    taxon: { id: 3, name: 'Aves', preferred_common_name: 'Birds', rank: 'class' },
    place: { id: 53229, name: 'Western Ghats', display_name: 'Western Ghats, IN', place_type_name: 'Region' },
    tag: 'Aves',
  },
  {
    label: 'Butterflies of Northeast India',
    taxon: { id: 47224, name: 'Papilionoidea', preferred_common_name: 'Butterflies', rank: 'superfamily' },
    place: { id: 7453, name: 'Assam', display_name: 'Assam, IN', place_type_name: 'State' },
    tag: 'Lepidoptera',
  },
  {
    label: 'Mammals of Central India',
    taxon: { id: 40151, name: 'Mammalia', preferred_common_name: 'Mammals', rank: 'class' },
    place: { id: 7745, name: 'Madhya Pradesh', display_name: 'Madhya Pradesh, IN', place_type_name: 'State' },
    tag: 'Mammalia',
  },
  {
    label: 'Himalayan Flora',
    taxon: { id: 47126, name: 'Plantae', preferred_common_name: 'Plants', rank: 'kingdom' },
    place: { id: 6681, name: 'Uttarakhand', display_name: 'Uttarakhand, IN', place_type_name: 'State' },
    tag: 'Plantae',
  },
  {
    label: 'Wildlife of India',
    taxon: { id: 1, name: 'Animalia', preferred_common_name: 'Animals', rank: 'kingdom' },
    place: { id: 6683, name: 'India', display_name: 'India', place_type_name: 'Country' },
    tag: 'Fauna',
  },
];
