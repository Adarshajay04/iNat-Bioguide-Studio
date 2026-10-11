/**
 * iNaturalist API Service
 * Public API endpoints: https://api.inaturalist.org/v1/
 */

const BASE_URL = 'https://api.inaturalist.org/v1';

// Upgrade square image URL to medium or large for crisp printing
export function getOptimizedImageUrl(photo, size = 'large') {
  if (!photo) return null;
  const url = photo.medium_url || photo.url || photo.square_url;
  if (!url) return null;
  
  // Replace size suffix in iNaturalist S3 URLs (e.g. /square.jpg -> /large.jpg)
  return url.replace(/\/(square|small)\./i, `/${size}.`);
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
    photo: photo ? {
      id: photo.id,
      squareUrl: photo.square_url,
      mediumUrl: photo.medium_url,
      largeUrl: getOptimizedImageUrl(photo, 'large'),
      originalUrl: getOptimizedImageUrl(photo, 'original'),
      attribution: formatAttribution(photo),
      rawAttribution: photo.attribution,
      licenseCode: photo.license_code,
      photographer: photo.attribution_name || 'Contributor',
    } : null,
  };
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
 * Curated presets for instant testing
 */
export const PRESETS = [
  {
    label: 'Birds of Costa Rica',
    taxon: { id: 3, name: 'Aves', preferred_common_name: 'Birds' },
    place: { id: 6924, display_name: 'Costa Rica' },
    icon: '🦜',
  },
  {
    label: 'Butterflies of California',
    taxon: { id: 47224, name: 'Papilionoidea', preferred_common_name: 'Butterflies' },
    place: { id: 14, display_name: 'California, US' },
    icon: '🦋',
  },
  {
    label: 'Fungi of Pacific Northwest',
    taxon: { id: 47170, name: 'Fungi', preferred_common_name: 'Fungi' },
    place: { id: 46, display_name: 'Washington, US' },
    icon: '🍄',
  },
  {
    label: 'Mammals of Yellowstone',
    taxon: { id: 40151, name: 'Mammalia', preferred_common_name: 'Mammals' },
    place: { id: 1623, display_name: 'Yellowstone National Park, US' },
    icon: '🐺',
  },
  {
    label: 'Wildflowers of Western Australia',
    taxon: { id: 47126, name: 'Plantae', preferred_common_name: 'Plants' },
    place: { id: 6825, display_name: 'Western Australia, AU' },
    icon: '🌸',
  },
  {
    label: 'Marine Fish of Hawaii',
    taxon: { id: 47273, name: 'Actinopterygii', preferred_common_name: 'Ray-finned Fishes' },
    place: { id: 11, display_name: 'Hawaii, US' },
    icon: '🐠',
  },
];
