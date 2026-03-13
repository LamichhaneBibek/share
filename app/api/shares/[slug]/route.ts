import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, SharedItem } from '@/lib/db';

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

    return NextResponse.json(item);
  } catch (error) {
    console.error('WebApp error fetching share: ', error);
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
