import { getRequestLogs } from '@/lib/requestLogs';

export const dynamic = 'force-dynamic';

export default function LogsPage() {
    const logs = getRequestLogs();

    return (
        <main className="min-h-screen bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] px-4 py-8 text-slate-100">
            <section className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h1 className="text-2xl font-semibold">Received API Logs</h1>
                <p className="mt-2 text-sm text-slate-400">POST, PUT, PATCH, and DELETE requests to /api/log are listed below.</p>

                {logs.length === 0 ? (
                    <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-300">
                        No logs yet. Send a request to /api/log and refresh this page.
                    </p>
                ) : (
                    <div className="mt-6 space-y-4">
                        {logs.map((log) => (
                            <article key={log.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                    <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-medium text-cyan-200">
                                        {log.method}
                                    </span>
                                    <span>{log.path}</span>
                                    <span className="text-slate-500">{log.receivedAt}</span>
                                </div>

                                <pre className="overflow-x-auto rounded-lg bg-[#020617] p-3 text-xs leading-relaxed text-slate-200">
                                    {JSON.stringify(log, null, 2)}
                                </pre>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
