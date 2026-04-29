import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Wrap the generated Next.js handlers so mobile clients that omit an
// Origin header (Expo apps) are allowed. If Origin is missing, inject
// the mobile scheme so Better Auth origin validation passes.
const handler = toNextJsHandler(auth);

async function forward(req: Request) {
	const headers = new Headers(req.headers as HeadersInit);

	if (!headers.get('origin')) {
		// Inject the mobile app scheme used by the Expo client
		headers.set('origin', 'powertrackmobile://');
	}

	const body = await req.arrayBuffer();
	const forwarded = new Request(req.url, {
		method: req.method,
		headers,
		body: body.byteLength ? body : undefined,
	});

	// delegate to the underlying handler based on method
	switch (req.method) {
		case 'GET':
			return handler.GET ? handler.GET(forwarded) : new Response(null, { status: 405 });
		case 'POST':
			return handler.POST ? handler.POST(forwarded) : new Response(null, { status: 405 });
		case 'PUT':
			return handler.PUT ? handler.PUT(forwarded) : new Response(null, { status: 405 });
		case 'PATCH':
			return handler.PATCH ? handler.PATCH(forwarded) : new Response(null, { status: 405 });
		case 'DELETE':
			return handler.DELETE ? handler.DELETE(forwarded) : new Response(null, { status: 405 });
		case 'OPTIONS':
			return new Response(null, { status: 204 });
		default:
			return new Response(null, { status: 405 });
	}
}

export const GET = (req: Request) => forward(req);
export const POST = (req: Request) => forward(req);
export const PUT = (req: Request) => forward(req);
export const PATCH = (req: Request) => forward(req);
export const DELETE = (req: Request) => forward(req);
export const OPTIONS = (req: Request) => forward(req);
