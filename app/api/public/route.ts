import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, SharedItem } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const countResult = await db.execute(
      "SELECT COUNT(*) as total FROM shared_items WHERE is_public = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))"
    );
    const total = Number(countResult.rows[0].total);

    const itemsResult = await db.execute({
      sql: "SELECT id, slug, content, title, language, password, is_public, expires_at, created_at FROM shared_items WHERE is_public = 1 AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [limit, offset],
    });
    const items = itemsResult.rows as unknown as SharedItem[];

    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching public shares:', error);
    return NextResponse.json({ error: 'Failed to fetch public shares' }, { status: 500 });
  }
}
