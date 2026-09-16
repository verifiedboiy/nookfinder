import { neon } from '@neondatabase/serverless';
import { Property } from '@/types/property';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_4DrIzBjgfZU0@ep-rough-pond-b5ne5nik-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

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

export function getSql() {
  if (!DATABASE_URL) return null;
  try {
    return neon(DATABASE_URL);
  } catch (err) {
    console.error('Failed to initialize Neon SQL client:', err);
    return null;
  }
}

let isInitialized = false;

export async function initDb() {
  const sql = getSql();
  if (!sql || isInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    isInitialized = true;
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err);
  }
}

export async function dbGetProperties(): Promise<Property[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    const rows = await sql`
      SELECT data FROM properties
      ORDER BY updated_at DESC;
    `;
    return rows.map((row: any) => normalizeProperty(row.data as Property));
  } catch (err) {
    console.error('Neon DB get properties error:', err);
    return null;
  }
}

export async function dbSaveProperty(property: Property): Promise<Property[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    const normalized = normalizeProperty(property);
    const jsonString = JSON.stringify(normalized);

    await sql`
      INSERT INTO properties (id, data, updated_at)
      VALUES (${normalized.id}, ${jsonString}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        data = ${jsonString}::jsonb,
        updated_at = NOW();
    `;

    return await dbGetProperties();
  } catch (err) {
    console.error('Neon DB save property error:', err);
    return null;
  }
}

export async function dbSaveBatchProperties(properties: Property[]): Promise<Property[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    for (const p of properties) {
      if (p && p.id) {
        const normalized = normalizeProperty(p);
        const jsonString = JSON.stringify(normalized);
        await sql`
          INSERT INTO properties (id, data, updated_at)
          VALUES (${normalized.id}, ${jsonString}::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            data = ${jsonString}::jsonb,
            updated_at = NOW();
        `;
      }
    }
    return await dbGetProperties();
  } catch (err) {
    console.error('Neon DB batch save error:', err);
    return null;
  }
}

export async function dbDeleteProperty(id: string): Promise<Property[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    await sql`
      DELETE FROM properties WHERE id = ${id};
    `;
    return await dbGetProperties();
  } catch (err) {
    console.error('Neon DB delete property error:', err);
    return null;
  }
}

export async function dbClearAllProperties(): Promise<Property[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    await sql`DELETE FROM properties;`;
    return [];
  } catch (err) {
    console.error('Neon DB clear all error:', err);
    return null;
  }
}

export async function dbSaveInquiry(inquiry: any): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await initDb();
    const id = inquiry.id || `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const jsonString = JSON.stringify({ ...inquiry, id });
    await sql`
      INSERT INTO inquiries (id, data, created_at)
      VALUES (${id}, ${jsonString}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = ${jsonString}::jsonb;
    `;
    return true;
  } catch (err) {
    console.error('Neon DB save inquiry error:', err);
    return false;
  }
}

export async function dbGetInquiries(): Promise<any[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await initDb();
    const rows = await sql`
      SELECT data FROM inquiries ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => r.data);
  } catch (err) {
    console.error('Neon DB get inquiries error:', err);
    return null;
  }
}
