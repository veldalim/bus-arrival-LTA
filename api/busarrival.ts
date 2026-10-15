/**
 * Serverless Bus Arrival Endpoint
 * GET /api/busarrival?BusStopCode=83139&ServiceNo=...
 * 
 * Proxies requests to LTA DataMall v3 BusArrival endpoint:
 * https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
 * 
 * Headers used:
 * - AccountKey: process.env.LTA_ACCOUNT_KEY
 * - accept: application/json
 */

const LTA_DATAMALL_V3_BASE = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

export default async function handler(req: any, res?: any) {
  // Support both Web standard Request and Node.js / Express req
  let busStopCode = '83139';
  let serviceNo = '';
  let method = 'GET';

  if (typeof Request !== 'undefined' && req instanceof Request) {
    const url = new URL(req.url);
    busStopCode = url.searchParams.get('BusStopCode') || url.searchParams.get('busStopCode') || '83139';
    serviceNo = url.searchParams.get('ServiceNo') || url.searchParams.get('serviceNo') || '';
    method = req.method;
  } else if (req) {
    method = req.method || 'GET';
    const query = req.query || {};
    busStopCode = query.BusStopCode || query.busStopCode || '83139';
    serviceNo = query.ServiceNo || query.serviceNo || '';
  }

  // Handle CORS preflight
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, AccountKey, accept, Authorization',
    'Content-Type': 'application/json'
  };

  if (method === 'OPTIONS') {
    if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accept, Authorization');
    return res.status(204).end();
  }

  // Retrieve LTA Account Key from environment variables (do not hardcode)
  const ltaAccountKey = (
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    ''
  ).trim();

  // Construct upstream LTA DataMall v3 URL
  const ltaParams = new URLSearchParams();
  ltaParams.set('BusStopCode', busStopCode);
  if (serviceNo) {
    ltaParams.set('ServiceNo', serviceNo);
  }

  const upstreamUrl = `${LTA_DATAMALL_V3_BASE}?${ltaParams.toString()}`;

  // If the user has not yet configured their LTA_ACCOUNT_KEY environment variable
  if (!ltaAccountKey) {
    const responsePayload = {
      status: 'pending_key',
      warning: 'LTA_ACCOUNT_KEY environment variable is not configured yet.',
      message: 'Please set LTA_ACCOUNT_KEY in your environment to stream live data directly from LTA DataMall v3.',
      upstreamEndpoint: upstreamUrl,
      BusStopCode: busStopCode,
      Services: []
    };

    if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: corsHeaders
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(responsePayload);
  }

  // Fetch real-time data from LTA DataMall
  try {
    const ltaResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'AccountKey': ltaAccountKey,
        'accept': 'application/json'
      }
    });

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      const errorPayload = {
        error: `LTA DataMall responded with HTTP ${ltaResponse.status}`,
        statusText: ltaResponse.statusText,
        upstreamUrl,
        details: errorText
      };

      if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
        return new Response(JSON.stringify(errorPayload), {
          status: ltaResponse.status,
          headers: corsHeaders
        });
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(ltaResponse.status).json(errorPayload);
    }

    const data = await ltaResponse.json();

    // Cache-Control: LTA predictions update every ~15-20 seconds
    const responseHeaders = {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=15, s-maxage=15'
    };

    if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: responseHeaders
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=15');
    return res.status(200).json(data);

  } catch (error: any) {
    const failurePayload = {
      error: 'Failed to fetch live bus arrival data from LTA DataMall',
      upstreamUrl,
      message: error?.message || 'Network error connecting to datamall2.mytransport.sg'
    };

    if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
      return new Response(JSON.stringify(failurePayload), {
        status: 502,
        headers: corsHeaders
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(502).json(failurePayload);
  }
}
