/**
 * Local API server — the same handler Vercel runs, mounted on plain Node.
 *
 * The demo must not depend on a Vercel account, a login, or an internet
 * connection. `npm run api` gives the identical endpoint on localhost, so the
 * whole chain — click Accept, server throws, OTel exports, Mission Control
 * raises an incident — can be shown on a laptop with the wifi off.
 *
 *   npm run api
 *
 *   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:8080/v1/traces \
 *   MISSION_CONTROL_INGEST_KEY=mcik_... npm run api
 */
import { createServer } from 'node:http';

// The handler is TypeScript. `npm run api` starts node with `--import tsx`,
// matching how the test script already loads TypeScript in this repo.
const { default: verdictHandler } = await import('./api/verdict.ts');
const { default: healthHandler } = await import('./api/health.ts');

const PORT = Number(process.env.PORT ?? 3001);

function readBody(request) {
  return new Promise((resolve) => {
    let raw = '';
    request.on('data', (chunk) => (raw += chunk));
    request.on('end', () => resolve(raw));
  });
}

const ROUTES = {
  '/api/verdict': verdictHandler,
  '/api/health': healthHandler
};

const server = createServer(async (request, response) => {
  const route = Object.keys(ROUTES).find((r) => request.url?.startsWith(r));
  if (!route) {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const raw = await readBody(request);

  // Minimal shims for the two Vercel response methods the handler uses.
  let statusCode = 200;
  const shim = {
    setHeader: (name, value) => response.setHeader(name, value),
    status(code) {
      statusCode = code;
      return shim;
    },
    json(payload) {
      response.writeHead(statusCode, { 'content-type': 'application/json' });
      response.end(JSON.stringify(payload));
    }
  };

  await ROUTES[route]({ method: request.method, body: raw }, shim);
});

server.listen(PORT, () => {
  console.log(`Fieldlines API on http://localhost:${PORT}`);
  console.log(
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? `  exporting traces to ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`
      : '  telemetry disabled (set OTEL_EXPORTER_OTLP_ENDPOINT to enable)'
  );
});
