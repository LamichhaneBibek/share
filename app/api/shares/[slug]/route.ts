import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, SharedItem } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();

    const stmt = db.prepare('SELECT * FROM shared_items WHERE slug = ?');
    const item = stmt.get(slug) as SharedItem | undefined;

    if (!item) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('[v0] Error fetching share:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();

    const stmt = db.prepare('SELECT * FROM shared_items WHERE slug = ?');
    const item = stmt.get(slug) as SharedItem | undefined;

    if (!item) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM shared_items WHERE id = ?').run(item.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting share:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}
