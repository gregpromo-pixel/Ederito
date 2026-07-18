import { NextResponse } from 'next/server';

type AddressRequest = {
  line1?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddressRequest;
    const line1 = String(body.line1 || '').trim();
    const city = String(body.city || '').trim();
    const region = String(body.region || '').trim().toUpperCase();
    const postalCode = String(body.postalCode || '').trim();
    const country = String(body.country || 'US').trim().toUpperCase();

    if (country !== 'US') {
      return NextResponse.json({ matched: false, reason: 'US_ONLY' });
    }

    if (!line1 || !city || !region) {
      return NextResponse.json({ matched: false, reason: 'MISSING_FIELDS' }, { status: 400 });
    }

    const params = new URLSearchParams({
      street: line1,
      city,
      state: region,
      zip: postalCode,
      benchmark: 'Public_AR_Current',
      format: 'json'
    });

    const response = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/address?${params.toString()}`,
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'EderitoClientPortal/1.0' }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ matched: false, reason: 'PROVIDER_UNAVAILABLE' }, { status: 502 });
    }

    const payload = await response.json();
    const match = payload?.result?.addressMatches?.[0];

    if (!match) {
      return NextResponse.json({ matched: false, reason: 'NO_MATCH' });
    }

    const components = match.addressComponents || {};
    const lineParts = [
      components.fromAddress,
      components.preDirection,
      components.preType,
      components.streetName,
      components.suffixType,
      components.suffixDirection
    ].filter(Boolean);

    return NextResponse.json({
      matched: true,
      matchedAddress: match.matchedAddress,
      coordinates: match.coordinates || null,
      components: {
        line1: lineParts.join(' ').replace(/\s+/g, ' ').trim() || line1,
        city: components.city || city,
        region: components.state || region,
        postalCode: components.zip || postalCode,
        country: 'US'
      }
    });
  } catch {
    return NextResponse.json({ matched: false, reason: 'INVALID_REQUEST' }, { status: 400 });
  }
}
