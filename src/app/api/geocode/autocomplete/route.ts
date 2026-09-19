import { NextRequest, NextResponse } from 'next/server';
import { US_STATES } from '@/data/states';

export const dynamic = 'force-dynamic';

interface AddressSuggestion {
  id: string;
  displayName: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string; // 2-letter state code e.g. GA
  stateName: string;
  zipCode: string;
  lat: number;
  lng: number;
}

// In-memory cache for ultra-fast autocomplete responses and to stay well within rate limits
const cache = new Map<string, { timestamp: number; data: AddressSuggestion[] }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MAX_CACHE_SIZE = 300;

// Build fast state lookup map
const stateMap = new Map<string, string>();
US_STATES.forEach((s) => {
  stateMap.set(s.name.toLowerCase(), s.code);
  stateMap.set(s.code.toLowerCase(), s.code);
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 3) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const cacheKey = query.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, suggestions: cached.data });
    }

    // Call OpenStreetMap Nominatim with country code filter for USA
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'us');
    url.searchParams.set('limit', '6');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Nookfinder/1.0 (verifiedboiy@gmail.com)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn('Nominatim geocode query failed:', res.status, res.statusText);
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const rawData = await res.json();
    if (!Array.isArray(rawData)) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions: AddressSuggestion[] = rawData
      .map((item: any, idx: number) => {
        const addr = item.address || {};

        // House number + road
        const houseNumber = addr.house_number || '';
        const road = addr.road || addr.street || addr.footway || addr.pedestrian || '';
        let street = houseNumber && road ? `${houseNumber} ${road}` : (road || houseNumber || item.name || '');

        // Neighborhood
        const neighborhood =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.city_district ||
          addr.subdivision ||
          '';

        // City
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.hamlet ||
          addr.county?.replace(/ County$/i, '') ||
          '';

        // State & State Code
        const rawState = addr.state || '';
        const normalizedState = rawState.toLowerCase().trim();
        const stateCode = stateMap.get(normalizedState) || (rawState.length === 2 ? rawState.toUpperCase() : 'GA');

        // Zip Code
        const zipCode = (addr.postcode || '').split('-')[0].trim();

        // Coordinates
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (isNaN(lat) || isNaN(lng)) return null;

        // Display Name clean formatting
        const displayParts = [street, city, stateCode, zipCode].filter(Boolean);
        const cleanDisplayName = displayParts.length > 0 ? displayParts.join(', ') : item.display_name;

        return {
          id: `${item.place_id || idx}`,
          displayName: cleanDisplayName,
          street,
          neighborhood: neighborhood || (city ? `${city} District` : ''),
          city,
          state: stateCode,
          stateName: rawState,
          zipCode,
          lat,
          lng,
        };
      })
      .filter((s): s is AddressSuggestion => s !== null && !!s.street && !!s.city);

    // Maintain cache size
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { timestamp: Date.now(), data: suggestions });

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error('API /api/geocode/autocomplete error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Autocomplete request failed' },
      { status: 500 }
    );
  }
}
