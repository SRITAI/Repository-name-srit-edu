import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { searchSeedData } from '@/lib/data/seed-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || null;
    const includeAdult = searchParams.get('include_adult') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const supabase = await createClient();

    let results = null;

    if (supabase) {
      const { data, error } = await supabase.rpc('search_all', {
        q,
        category_slug: category,
        lim: limit,
        include_adult: includeAdult,
      });

      if (!error && data) {
        results = data;
      }
    }

    // Fallback to seed data if Supabase is unconfigured or returned no data
    if (!results || (!results.categories?.length && !results.reels?.length && !results.ads?.length)) {
      results = searchSeedData(q, category, includeAdult, limit);
    }

    // Server-side telemetry log (best-effort, non-blocking)
    if (q.trim().length >= 2) {
      try {
        const admin = createAdminClient();
        if (admin) {
          const totalCount =
            (results.categories?.length || 0) +
            (results.reels?.length || 0) +
            (results.ads?.length || 0);

          await admin.from('search_logs').insert({
            query: q.trim(),
            category_slug: category,
            results_count: totalCount,
          });
        }
      } catch {
        // Silently ignore logging errors
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
