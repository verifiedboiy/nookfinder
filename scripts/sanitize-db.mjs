import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4DrIzBjgfZU0@ep-rough-pond-b5ne5nik-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const FALLBACK_HOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
];

function sanitizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((img, idx) => {
    if (img && img.url && img.url.startsWith('data:')) {
      return {
        ...img,
        url: FALLBACK_HOUSE_IMAGES[idx % FALLBACK_HOUSE_IMAGES.length],
      };
    }
    return img;
  });
}

function sanitizeProperty(p) {
  if (!p) return p;
  return {
    ...p,
    images: sanitizeImages(p.images),
  };
}

async function run() {
  console.log('Sanitizing local data/properties.json...');
  const dataPath = path.join(process.cwd(), 'data', 'properties.json');
  if (fs.existsSync(dataPath)) {
    try {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const properties = JSON.parse(raw);
      if (Array.isArray(properties)) {
        const sanitized = properties.map(sanitizeProperty);
        fs.writeFileSync(dataPath, JSON.stringify(sanitized, null, 2), 'utf-8');
        console.log(`Successfully sanitized ${sanitized.length} local properties. File size reduced!`);
      }
    } catch (err) {
      console.error('Error reading/writing local properties.json:', err);
    }
  }

  console.log('Sanitizing Neon PostgreSQL properties table...');
  try {
    const sql = neon(DATABASE_URL);
    const rows = await sql`SELECT id, data FROM properties;`;
    console.log(`Found ${rows.length} rows in database.`);

    let cleaned = 0;
    for (const row of rows) {
      const p = row.data;
      if (p && p.images && p.images.some((img) => img?.url?.startsWith('data:'))) {
        const cleanP = sanitizeProperty(p);
        await sql`
          UPDATE properties
          SET data = ${JSON.stringify(cleanP)}, updated_at = NOW()
          WHERE id = ${row.id};
        `;
        cleaned++;
      }
    }
    console.log(`Cleaned and updated ${cleaned} properties with Base64 in PostgreSQL.`);
  } catch (err) {
    console.error('Database sanitize error:', err);
  }

  console.log('Sanitization complete!');
}

run();
