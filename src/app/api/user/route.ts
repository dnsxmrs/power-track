import { prisma } from '@/lib/prisma';
import { addRequestLog } from '@/lib/requestLogs';
import crypto from 'crypto';

const RATE_LIMIT_MAP = new Map<string, { count: number; windowStart: number }>();

const getEnv = (key: string, fallback = ''): string => (process.env[key] ?? fallback) as string;

const RATE_LIMIT_MAX = Number(getEnv('RATE_LIMIT_MAX', '20'));
const RATE_LIMIT_WINDOW_MS = Number(getEnv('RATE_LIMIT_WINDOW_MS', String(60 * 1000)));
const ALLOWED_SKEW_MS = Number(getEnv('ALLOWED_TIMESTAMP_SKEW_MS', String(5 * 60 * 1000)));
const API_KEY = getEnv('API_KEY');
const SIGNING_SECRET = getEnv('SIGNING_SECRET');
const API_BEARER_TOKEN = getEnv('API_BEARER_TOKEN');

function rateLimitKey(req: Request, apiKeyHeader?: string) {
	try {
		if (apiKeyHeader) return `apiKey:${apiKeyHeader}`;
		const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
		if (forwarded) return `ip:${forwarded.split(',')[0].trim()}`;
	} catch {
		// ignore
	}
	return 'anon';
}

function tooManyRequests(key: string) {
	const now = Date.now();
	const entry = RATE_LIMIT_MAP.get(key);
	if (!entry) {
		RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
		return false;
	}

	if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
		RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
		return false;
	}

	entry.count += 1;
	RATE_LIMIT_MAP.set(key, entry);
	return entry.count > RATE_LIMIT_MAX;
}

function unauthorizedJson(msg = 'Unauthorized') {
	return new Response(JSON.stringify({ error: msg }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}

function badRequestJson(msg = 'Bad Request') {
	return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
	const raw = await req.text();
	const timestampHeader = req.headers.get('x-timestamp');
	const signatureHeader = req.headers.get('x-signature');
	const apiKeyHeader = req.headers.get('x-api-key') || '';
	const authHeader = req.headers.get('authorization') || '';
	const requiredHeader = req.headers.get('x-client') || req.headers.get('x-client-version');

	// Basic header presence check
	if (!requiredHeader) return unauthorizedJson('Missing required header: x-client or x-client-version');

	// Timestamp validation
	if (!timestampHeader) return unauthorizedJson('Missing timestamp');
	const timestamp = Number(timestampHeader);
	if (!Number.isFinite(timestamp)) return unauthorizedJson('Invalid timestamp');
	if (Math.abs(Date.now() - timestamp) > ALLOWED_SKEW_MS) return unauthorizedJson('Timestamp out of allowed range');

	// API Key
	if (!API_KEY || apiKeyHeader !== API_KEY) return unauthorizedJson('Invalid API Key');

	// Bearer token
	if (!authHeader.startsWith('Bearer ')) return unauthorizedJson('Missing Bearer token');
	const bearer = authHeader.slice('Bearer '.length).trim();
	if (!API_BEARER_TOKEN || bearer !== API_BEARER_TOKEN) return unauthorizedJson('Invalid bearer token');

	// Signature verification
	if (!SIGNING_SECRET) return unauthorizedJson('Server signing key not configured');
	if (!signatureHeader) return unauthorizedJson('Missing signature');
	try {
		const url = new URL(req.url);
		const path = url.pathname;
		const h = crypto.createHmac('sha256', SIGNING_SECRET);
		h.update(`${req.method}|${path}|${timestamp}|${raw}`);
		const expected = h.digest('hex');
		if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signatureHeader, 'hex'))) {
			return unauthorizedJson('Invalid signature');
		}
	} catch {
		return unauthorizedJson('Signature verification failed');
	}

	// Rate limiting
	const key = rateLimitKey(req, apiKeyHeader || undefined);
	if (tooManyRequests(key)) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { 'Content-Type': 'application/json' } });

	// Parse JSON body
	let body: unknown;
	try {
		body = raw ? (JSON.parse(raw) as unknown) : {};
	} catch {
		return badRequestJson('Invalid JSON body');
	}

	const bodyObject = isPlainObject(body) ? body : {};

	const email = (bodyObject.email ?? '').toString().trim().toLowerCase();
	if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
		return badRequestJson('Invalid or missing email');
	}

	// Log request (non-blocking)
	addRequestLog({
		method: req.method,
		path: new URL(req.url).pathname,
		query: Object.fromEntries(new URL(req.url).searchParams.entries()),
		headers: Object.fromEntries(req.headers.entries()),
		payload: body,
	}).catch(() => {
		// ignore logging errors
	});

	// Fetch user from database
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

		const safeUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			twoFactorEnabled: user.twoFactorEnabled,
			image: user.image,
			phoneNumber: user.phoneNumber,
			banned: user.banned,
			banReason: user.banReason,
			banExpires: user.banExpires?.toISOString() ?? null,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};

		return new Response(JSON.stringify({ user: safeUser }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch {
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
}

