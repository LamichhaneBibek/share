import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, SharedItem } from '@/lib/db';
import { getOrCreateSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    const result = await db.execute({
      sql: 'SELECT * FROM shared_items WHERE slug = ?',
      args: [slug],
    });
    const item = result.rows[0] as unknown as SharedItem | undefined;

    if (!item) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    if (item.expires_at && new Date(item.expires_at as string) < new Date()) {
      return NextResponse.json(
        { error: 'This share has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('WebApp error fetching share: ', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();
    const body = await request.json();
    const { isPublic } = body;

    const result = await db.execute({
      sql: 'SELECT id, session_id FROM shared_items WHERE slug = ?',
      args: [slug],
    });
    const item = result.rows[0];

    if (!item) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (item.session_id !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.execute({
      sql: 'UPDATE shared_items SET is_public = ? WHERE slug = ?',
      args: [isPublic ? 1 : 0, slug],
    });

    return NextResponse.json({ success: true, isPublic: !!isPublic });
  } catch (error) {
    console.error('WebApp error toggling share visibility: ', error);
    return NextResponse.json({ error: 'Failed to update share' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    const result = await db.execute({
      sql: 'SELECT * FROM shared_items WHERE slug = ?',
      args: [slug],
    });
    const item = result.rows[0] as unknown as SharedItem | undefined;

    if (!item) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM shared_items WHERE id = ?',
      args: [item.id as string],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebApp error deleting share: ', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}
