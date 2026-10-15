/**
 * Serverless Health Check Endpoint
 * GET /api/health
 */

interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
  ltaKeyConfigured: boolean;
  version: string;
}

export default async function handler(req: any, res?: any) {
  const ltaKeyConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY || 
    process.env.LTA_API_KEY || 
    process.env.ACCOUNT_KEY
  );

  const data: HealthResponse = {
    status: 'ok',
    service: 'LTA DataMall Bus Arrival Serverless Gateway',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured,
    version: 'v3'
  };

  // Web Standard Response (Fetch / Next.js / Cloudflare / Deno)
  if (typeof Response !== 'undefined' && (!res || typeof res.status !== 'function')) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, AccountKey, accept'
      }
    });
  }

  // Node.js / Express / Vercel Serverless (req, res)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json(data);
}
