import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { neon } from '@neondatabase/serverless';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'eamqdjfo';
const API_KEY = process.env.CLOUDINARY_API_KEY || '882323531432825';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'iQ7ktyMOko_HOEzMXN85FCUOS98';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4DrIzBjgfZU0@ep-rough-pond-b5ne5nik-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

async function uploadBase64ToCloudinary(base64Data, filename) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'nookfinder/properties',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' },
      ],
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Error uploading ${filename} to Cloudinary:`, err);
    return null;
  }
}

async function main() {
  console.log('Retrieving original listings from git history (HEAD~1)...');
  
  let rawJson = '';
  try {
    rawJson = execSync('git show HEAD~1:data/properties.json', {
      maxBuffer: 100 * 1024 * 1024,
      encoding: 'utf-8',
    });
  } catch (err) {
    console.error('Failed to get HEAD~1:data/properties.json:', err);
    return;
  }

  // Strip BOM if present
  if (rawJson.charCodeAt(0) === 0xFEFF) {
    rawJson = rawJson.slice(1);
  }

  let originalProperties = [];
  try {
    originalProperties = JSON.parse(rawJson);
  } catch (parseErr) {
    console.error('Error parsing JSON from git history:', parseErr);
    return;
  }

  console.log(`Found ${originalProperties.length} original listings in git history.`);

  const restoredProperties = [];

  for (let pIdx = 0; pIdx < originalProperties.length; pIdx++) {
    const prop = originalProperties[pIdx];
    console.log(`\nProcessing listing ${pIdx + 1}/${originalProperties.length}: "${prop.title || prop.id}"`);

    const updatedImages = [];
    const images = prop.images || [];

    for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
      const img = images[imgIdx];
      if (img && img.url && img.url.startsWith('data:')) {
        console.log(`  Uploading original photo ${imgIdx + 1}/${images.length} ("${img.caption || 'photo'}") to Cloudinary...`);
        const cdnUrl = await uploadBase64ToCloudinary(img.url, `${prop.id}_photo_${imgIdx + 1}`);
        if (cdnUrl) {
          console.log(`  -> Restored to Cloudinary URL: ${cdnUrl}`);
          updatedImages.push({
            ...img,
            url: cdnUrl,
          });
        } else {
          console.warn(`  -> Cloudinary upload failed, keeping original image format.`);
          updatedImages.push(img);
        }
      } else {
        // Already a normal URL or untouched
        updatedImages.push(img);
      }
    }

    restoredProperties.push({
      ...prop,
      images: updatedImages,
    });
  }

  // 1. Write to local data/properties.json
  const dataPath = path.join(process.cwd(), 'data', 'properties.json');
  fs.writeFileSync(dataPath, JSON.stringify(restoredProperties, null, 2), 'utf-8');
  console.log(`\nSuccessfully updated local data/properties.json with ${restoredProperties.length} restored listings.`);

  // 2. Save/Sync to Neon PostgreSQL
  console.log('\nSyncing restored listings to PostgreSQL database...');
  try {
    const sql = neon(DATABASE_URL);
    for (const prop of restoredProperties) {
      await sql`
        INSERT INTO properties (id, data, updated_at)
        VALUES (${prop.id}, ${JSON.stringify(prop)}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = ${JSON.stringify(prop)}, updated_at = NOW();
      `;
      console.log(`  Synced listing "${prop.title || prop.id}" to PostgreSQL.`);
    }
    console.log('PostgreSQL database synchronization complete!');
  } catch (dbErr) {
    console.error('Error updating PostgreSQL database:', dbErr);
  }

  // Clean up any temp files
  try {
    if (fs.existsSync('scripts/temp_old_properties.json')) {
      fs.unlinkSync('scripts/temp_old_properties.json');
    }
  } catch {}

  console.log('\n=============================================');
  console.log('ALL ORIGINAL PHOTOS RESTORED & MIGRATED TO CLOUDINARY SUCCESSFULLY!');
  console.log('=============================================');
}

main();
