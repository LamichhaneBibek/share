import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const db = await getDatabase();
    const result = await db.execute(
      "DELETE FROM shared_items WHERE expires_at IS NOT NULL AND expires_at < datetime('now')"
    );

    const deleted = result.rowsAffected ?? 0;
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
