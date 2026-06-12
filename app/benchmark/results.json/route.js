import results from '../../lib/benchmarkResults.json';

// Machine-readable twin of the /benchmark page: agents/models can read the
// scores directly without scraping HTML. Same data the page renders.
export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
