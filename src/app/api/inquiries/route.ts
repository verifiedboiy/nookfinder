import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'resolved';
}

const DATA_DIR = path.join(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

function ensureInquiriesFile(): Inquiry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(INQUIRIES_FILE)) {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading inquiries:', error);
    return [];
  }
}

function writeInquiriesFile(inquiries: Inquiry[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving inquiries:', error);
    return false;
  }
}

// GET /api/inquiries - List all inquiries
export async function GET() {
  const inquiries = ensureInquiriesFile();
  return NextResponse.json({ success: true, inquiries }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

// POST /api/inquiries - Record a new showing/tour inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      propertyId: body.propertyId || 'general',
      propertyTitle: body.propertyTitle || 'Nookfinder Property',
      propertyAddress: body.propertyAddress || 'Verified Listing',
      propertyPrice: Number(body.propertyPrice) || 0,
      userName: body.userName || 'Prospective Buyer/Renter',
      userEmail: body.userEmail || 'nookkfinder@gmail.com',
      userPhone: body.userPhone || '',
      message: body.message || 'I would like to schedule a tour of this verified listing.',
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const current = ensureInquiriesFile();
    const updated = [newInquiry, ...current];
    writeInquiriesFile(updated);

    return NextResponse.json({ success: true, inquiry: newInquiry, inquiries: updated });
  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/inquiries?id=[id]
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'clear_all') {
      writeInquiriesFile([]);
      return NextResponse.json({ success: true, inquiries: [] });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing inquiry ID' }, { status: 400 });
    }

    const current = ensureInquiriesFile();
    const updated = current.filter((i) => i.id !== id);
    writeInquiriesFile(updated);

    return NextResponse.json({ success: true, inquiries: updated });
  } catch (error: any) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
