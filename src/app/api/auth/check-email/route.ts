import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body?.email?.toLowerCase?.().trim?.();

        if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return new Response(JSON.stringify({ error: 'invalid_email' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        return new Response(JSON.stringify({ exists: Boolean(user) }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err) {
        console.error('check-email error', err);
        return new Response(JSON.stringify({ error: 'server_error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
