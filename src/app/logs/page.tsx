import { getRequestLogs } from '@/lib/requestLogs';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
    const logs = await getRequestLogs();

    return (
        <main className="min-h-screen bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] px-4 py-8 text-slate-100">
            <section className="mx-auto w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h1 className="text-2xl font-semibold">Energy Logs</h1>
                <p className="mt-2 text-sm text-slate-400">All received energy data logs.</p>

                {logs.length === 0 ? (
                    <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-300">
                        No logs yet. Send a request to /api/log and refresh this page.
                    </p>
                ) : (
                    <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/30">
                                    <th className="px-4 py-3 text-left font-semibold text-cyan-200">Source</th>
                                    <th className="px-4 py-3 text-left font-semibold text-cyan-200">Energy Details</th>
                                    <th className="px-4 py-3 text-left font-semibold text-cyan-200">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr key={log.id} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-black/10' : 'bg-black/5'} hover:bg-black/20`}>
                                        <td className="px-4 py-3 text-slate-300">
                                            {log.path || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-200">
                                            <pre className="whitespace-pre-wrap break-words text-xs">
                                                {JSON.stringify(log.payload ?? {}, null, 2)}
                                            </pre>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {new Date(log.receivedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
