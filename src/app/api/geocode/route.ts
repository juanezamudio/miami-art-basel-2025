import { NextResponse } from 'next/server';

// Cache geocoded addresses to avoid repeated API calls
const geocodeCache: Record<string, { lat: number; lng: number } | null> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Check cache first
  if (geocodeCache[address] !== undefined) {
    return NextResponse.json({ coordinates: geocodeCache[address] });
  }

  try {
    // Use OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Basel.ai Miami Art Basel Guide (contact@example.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      geocodeCache[address] = coordinates;
      return NextResponse.json({ coordinates });
    }

    // No results found
    geocodeCache[address] = null;
    return NextResponse.json({ coordinates: null });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
