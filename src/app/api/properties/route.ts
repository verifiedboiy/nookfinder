import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Property } from '@/types/property';
import { MOCK_PROPERTIES } from '@/data/mockProperties';
import {
  dbGetProperties,
  dbSaveProperty,
  dbSaveBatchProperties,
  dbDeleteProperty,
  dbClearAllProperties,
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'properties.json');

const OFFICIAL_EMAIL = 'nookkfinder@gmail.com';
const OFFICIAL_TELEGRAM = 'https://t.me/nook_finder';

function normalizeProperty(p: Property): Property {
  if (!p) return p;
  return {
    ...p,
    agent: p.agent
      ? {
          ...p.agent,
          email: OFFICIAL_EMAIL,
          telegram: OFFICIAL_TELEGRAM,
        }
      : {
          name: 'Marcus Vance',
          title: 'Nookfinder Dedicated Property Specialist',
          phone: '+1 (404) 890-1244',
          email: OFFICIAL_EMAIL,
          telegram: OFFICIAL_TELEGRAM,
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          rating: 4.9,
          reviewCount: 42,
          verifiedLicense: 'NF-STAFF-40918',
          isNookfinderStaff: true,
        },
  };
}

function ensureDataFile(): Property[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: Property[] = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProperty);
  } catch (error) {
    console.error('Error accessing properties data file:', error);
    return [];
  }
}

function writeDataFile(properties: Property[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const normalized = properties.map(normalizeProperty);
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing properties data file:', error);
    return false;
  }
}

// GET /api/properties - Retrieve all properties from Neon Postgres or file backup
export async function GET() {
  try {
    const dbProps = await dbGetProperties();
    if (dbProps !== null) {
      // Sync to local backup in background
      writeDataFile(dbProps);
      return NextResponse.json(
        { success: true, properties: dbProps, source: 'database' },
        { headers: NO_CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.warn('DB GET fallback to file:', err);
  }

  const properties = ensureDataFile();
  return NextResponse.json(
    { success: true, properties, source: 'file' },
    { headers: NO_CACHE_HEADERS }
  );
}

// POST /api/properties - Add or update a property
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      const resetListings = MOCK_PROPERTIES.map(normalizeProperty);
      try {
        await dbSaveBatchProperties(resetListings);
      } catch {}
      writeDataFile(resetListings);
      return NextResponse.json({ success: true, properties: resetListings });
    }

    const body = await req.json();

    // Support batch reseeding / bulk sync
    if (body.properties && Array.isArray(body.properties)) {
      const normalizedList = body.properties
        .filter((p: any) => p && p.id && p.title)
        .map(normalizeProperty);

      let updatedFromDb = await dbSaveBatchProperties(normalizedList);
      if (updatedFromDb !== null) {
        writeDataFile(updatedFromDb);
        return NextResponse.json({ success: true, properties: updatedFromDb, source: 'database' });
      }

      const current = ensureDataFile();
      const currentMap = new Map(current.map((p) => [p.id, p]));
      for (const p of normalizedList) {
        currentMap.set(p.id, p);
      }
      const updated = Array.from(currentMap.values());
      writeDataFile(updated);
      return NextResponse.json({ success: true, properties: updated, source: 'file' });
    }

    const propertyToSave: Property = body.property || body;

    if (!propertyToSave || !propertyToSave.title) {
      return NextResponse.json({ success: false, error: 'Invalid property payload' }, { status: 400 });
    }

    const normalized = normalizeProperty(propertyToSave);

    // Save to Database
    const dbUpdated = await dbSaveProperty(normalized);
    if (dbUpdated !== null) {
      writeDataFile(dbUpdated);
      return NextResponse.json({ success: true, properties: dbUpdated, source: 'database' });
    }

    // Fallback to file storage
    const current = ensureDataFile();
    const existingIndex = current.findIndex((p) => p.id === normalized.id);

    let updated: Property[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = normalized;
    } else {
      updated = [normalized, ...current];
    }

    writeDataFile(updated);
    return NextResponse.json({ success: true, properties: updated, source: 'file' });
  } catch (error: any) {
    console.error('Error updating property on server:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties?id=[id] or DELETE /api/properties?action=clear_all
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'clear_all') {
      await dbClearAllProperties();
      writeDataFile([]);
      return NextResponse.json({ success: true, properties: [] });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing property ID' }, { status: 400 });
    }

    // Delete from Database
    const dbUpdated = await dbDeleteProperty(id);
    if (dbUpdated !== null) {
      writeDataFile(dbUpdated);
      return NextResponse.json({ success: true, properties: dbUpdated, source: 'database' });
    }

    // Fallback to file storage
    const current = ensureDataFile();
    const updated = current.filter((p) => p.id !== id);
    writeDataFile(updated);

    return NextResponse.json({ success: true, properties: updated, source: 'file' });
  } catch (error: any) {
    console.error('Error deleting property on server:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
