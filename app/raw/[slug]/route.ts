import { NextRequest } from 'next/server';
import { getDatabase, SharedItem } from '@/lib/db';
import { isExpired } from '@/lib/dates';

// Plain-text view of a paste, pastebin-style: /raw/<slug>
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    const result = await db.execute({
      sql: 'SELECT content, password, expires_at FROM shared_items WHERE slug = ?',
      args: [slug],
    });
    const item = result.rows[0] as unknown as Pick<SharedItem, 'content' | 'password' | 'expires_at'> | undefined;

    if (!item) {
      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    if (isExpired(item.expires_at)) {
      return new Response('This paste has expired', { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    if (item.password) {
      const provided = new URL(request.url).searchParams.get('password');
      if (provided !== item.password) {
        return new Response('This paste is password protected. Append ?password=<password> to view it raw.', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    return new Response(item.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('WebApp error fetching raw paste: ', error);
    return new Response('Failed to fetch paste', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
