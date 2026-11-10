import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchAdListingsLocal } from '@/lib/data/ad-explorer-seed';
import { AdPlatform, CreativeFormat } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

function enrichListingsWithMedia(items: any[], mediaRows: any[] = []): any[] {
  const mediaMap: Record<string, any[]> = {};
  for (const m of mediaRows) {
    if (!mediaMap[m.ad_listing_id]) {
      mediaMap[m.ad_listing_id] = [];
    }
    mediaMap[m.ad_listing_id].push(m);
  }

  return items.map((item) => {
    let mediaList = item.media_items;
    if (Array.isArray(mediaList) && mediaList.length > 0) {
      return item;
    }

    if (mediaMap[item.id] && mediaMap[item.id].length > 0) {
      return { ...item, media_items: mediaMap[item.id] };
    }

    // Synthesize media items from legacy single-media fields
    const synthesized: any[] = [];
    if (item.media_url) {
      const isDirect =
        item.media_url.endsWith(".mp4") ||
        item.media_url.endsWith(".webm") ||
        item.media_url.endsWith(".mov");
      synthesized.push({
        ad_listing_id: item.id,
        media_type: isDirect ? "hosted_video" : "embed",
        media_url: item.media_url,
        thumbnail_url: item.preview_image_path || null,
        caption: item.title,
        display_order: 0,
      });
    } else if (item.preview_image_path) {
      synthesized.push({
        ad_listing_id: item.id,
        media_type: "image",
        media_url: item.preview_image_path,
        thumbnail_url: item.preview_image_path,
        caption: item.title,
        display_order: 0,
      });
    } else if (item.source_url) {
      synthesized.push({
        ad_listing_id: item.id,
        media_type: "source_link",
        media_url: item.source_url,
        thumbnail_url: null,
        caption: `Official listing on ${item.platform}`,
        display_order: 0,
      });
    }

    return { ...item, media_items: synthesized };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = (searchParams.get('q') || '').trim();
    const platformsParam = searchParams.get('platforms');
    const category = searchParams.get('category') || 'all';
    const country = searchParams.get('country') || 'all';
    const format = (searchParams.get('format') || 'all') as CreativeFormat | 'all';
    const signal = searchParams.get('signal') || 'all';
    const sort = (searchParams.get('sort') || 'reviewed') as 'reviewed' | 'added' | 'featured';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24', 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const platforms: AdPlatform[] = platformsParam
      ? (platformsParam.split(',').filter(Boolean) as AdPlatform[])
      : [];

    // Attempt querying Supabase
    try {
      const supabase = await createClient();
      if (supabase) {
        // Try RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_ad_listings', {
          q: query || null,
          p_platforms: platforms.length > 0 ? platforms : null,
          p_category: category !== 'all' ? category : null,
          p_country: country !== 'all' ? country : null,
          p_format: format !== 'all' ? format : null,
          p_signal: signal !== 'all' ? signal : null,
          p_sort: sort,
          p_limit: limit,
          p_offset: offset,
        });

        if (!rpcError && rpcData && Array.isArray((rpcData as any).items)) {
          const rawItems = (rpcData as any).items;
          const enriched = enrichListingsWithMedia(rawItems);
          return NextResponse.json({
            items: enriched,
            total: (rpcData as any).total || 0,
            source: 'supabase_rpc',
          });
        }

        // Fallback to direct table query on ad_listings if RPC not applied yet
        let queryBuilder = supabase
          .from('ad_listings')
          .select('*', { count: 'exact' })
          .eq('status', 'published');

        if (platforms.length > 0) {
          queryBuilder = queryBuilder.in('platform', platforms);
        }
        if (category && category !== 'all') {
          queryBuilder = queryBuilder.eq('category', category);
        }
        if (country && country !== 'all') {
          queryBuilder = queryBuilder.eq('country_code', country);
        }
        if (format && format !== 'all') {
          queryBuilder = queryBuilder.eq('creative_format', format);
        }
        if (signal && signal !== 'all') {
          queryBuilder = queryBuilder.contains('signal_labels', [signal]);
        }
        if (query) {
          queryBuilder = queryBuilder.or(
            `brand_name.ilike.%${query}%,advertiser_name.ilike.%${query}%,title.ilike.%${query}%,short_description.ilike.%${query}%,hook_summary.ilike.%${query}%,curator_note.ilike.%${query}%,category.ilike.%${query}%,asin.ilike.%${query}%,search_term.ilike.%${query}%`
          );
        }

        if (sort === 'featured') {
          queryBuilder = queryBuilder.order('is_featured', { ascending: false }).order('last_reviewed_at', { ascending: false });
        } else if (sort === 'added') {
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
        } else {
          queryBuilder = queryBuilder.order('last_reviewed_at', { ascending: false });
        }

        queryBuilder = queryBuilder.range(offset, offset + limit - 1);

        const { data: tableData, count, error: tableError } = await queryBuilder;

        // If table query succeeded without error, return the database results (even if 0 rows)
        if (!tableError && tableData !== null) {
          let sortedData = [...tableData];
          if (query && sortedData.length > 0) {
            const lowerQ = query.toLowerCase();
            sortedData.sort((a, b) => {
              const aExact =
                (a.brand_name || '').toLowerCase() === lowerQ ||
                (a.advertiser_name || '').toLowerCase() === lowerQ;
              const bExact =
                (b.brand_name || '').toLowerCase() === lowerQ ||
                (b.advertiser_name || '').toLowerCase() === lowerQ;
              if (aExact && !bExact) return -1;
              if (!aExact && bExact) return 1;

              const aPartial =
                (a.brand_name || '').toLowerCase().includes(lowerQ) ||
                (a.advertiser_name || '').toLowerCase().includes(lowerQ);
              const bPartial =
                (b.brand_name || '').toLowerCase().includes(lowerQ) ||
                (b.advertiser_name || '').toLowerCase().includes(lowerQ);
              if (aPartial && !bPartial) return -1;
              if (!aPartial && bPartial) return 1;

              return 0;
            });
          }

          // Try fetching normalized media items for this batch if table exists
          let mediaRows: any[] = [];
          if (sortedData.length > 0) {
            try {
              const ids = sortedData.map((d: any) => d.id);
              const { data: mData } = await supabase
                .from('ad_media_items')
                .select('*')
                .in('ad_listing_id', ids)
                .order('display_order', { ascending: true });
              if (mData) mediaRows = mData;
            } catch {
              // Table not yet migrated
            }
          }

          const enriched = enrichListingsWithMedia(sortedData, mediaRows);

          return NextResponse.json({
            items: enriched,
            total: count !== null && count !== undefined ? count : sortedData.length,
            source: 'supabase_table',
          });
        }
      }
    } catch {
      // Supabase connection unavailable or not configured
    }

    // Local verified catalogue search
    const localResult = searchAdListingsLocal({
      query,
      platforms,
      category,
      country,
      format,
      signal,
      sort,
      limit,
      offset,
    });

    return NextResponse.json({
      items: localResult.items,
      total: localResult.total,
      source: 'local_catalogue',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to search ad listings', items: [], total: 0 },
      { status: 500 }
    );
  }
}
