import { type NextRequest, NextResponse } from 'next/server';

import {
  readHarborLeaderboardWithDomains,
  readPublicHarborLeaderboard,
} from '@/lib/harbor-leaderboard.server';
import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
} from '@/lib/leaderboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Let the CDN absorb traffic in production; always fresh while developing. */
const CACHE_CONTROL =
  process.env.NODE_ENV === 'development'
    ? 'no-store'
    : 'public, s-maxage=300, stale-while-revalidate=3600';

function notFound() {
  return NextResponse.json(
    { error: { message: 'Not found', code: 'not_found' } },
    { status: 404 },
  );
}

export async function GET(request: NextRequest) {
  const packageName = request.nextUrl.searchParams.get('package');
  const leaderboardName = request.nextUrl.searchParams.get('name');
  if (
    packageName !== TERMINAL_BENCH_PACKAGE ||
    leaderboardName !== TERMINAL_BENCH_LEADERBOARD
  ) {
    return notFound();
  }

  // With a Harbor API key we can attach per-domain metrics (read from each
  // row's trials). Without one, or if that enrichment fails, serve the public
  // leaderboard so the table always renders.
  const apiKey = process.env.HARBOR_API_KEY?.trim();
  if (apiKey) {
    try {
      const payload = await readHarborLeaderboardWithDomains(
        apiKey,
        TERMINAL_BENCH_PACKAGE,
        TERMINAL_BENCH_LEADERBOARD,
      );
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': CACHE_CONTROL },
      });
    } catch (error) {
      console.error(
        'Failed to load the Harbor leaderboard with domain metrics; falling back to the public leaderboard:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  try {
    const payload = await readPublicHarborLeaderboard(
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    );
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error(
      'Failed to load the public Harbor leaderboard:',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: {
          message: 'Failed to load the Harbor leaderboard',
          code: 'upstream_error',
        },
      },
      { status: 502 },
    );
  }
}
