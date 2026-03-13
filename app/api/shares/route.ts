import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, generateSlug } from '@/lib/session';
import { getDatabase, SharedItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const MAX_CONTENT_LENGTH = 1_000_000; // 1MB

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, password } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content exceeds maximum size of ${MAX_CONTENT_LENGTH / 1000}KB` },
        { status: 413 }
      );
    }

    const sessionId = await getOrCreateSession();
    const db = await getDatabase();
    const id = uuidv4();
    const slug = generateSlug();

    await db.execute({
      sql: 'INSERT INTO shared_items (id, session_id, slug, content, password) VALUES (?, ?, ?, ?, ?)',
      args: [id, sessionId, slug, content, password || null],
    });

    return NextResponse.json({
      id,
      slug,
      shareUrl: `/share/${slug}`,
      hasPassword: !!password,
    });
  } catch (error) {
    console.error('WebApp error creating share: ', error);
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();

    // Get pagination parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM shared_items WHERE session_id = ?',
      args: [sessionId],
    });
    const total = Number(countResult.rows[0].total);

    // Get paginated items
    const itemsResult = await db.execute({
      sql: 'SELECT id, slug, content, password, created_at FROM shared_items WHERE session_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      args: [sessionId, limit, offset],
    });
    const items = itemsResult.rows as unknown as SharedItem[];

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('WebApp error fetching shares: ', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}
