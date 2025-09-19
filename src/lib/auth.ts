export function requireApiKey(req: Request) {
  const supplied = req.headers.get('x-api-key');
  if (!process.env.API_KEY || supplied !== process.env.API_KEY) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 401
    });
  }
}