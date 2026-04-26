import { Sidebar } from '../components/Sidebar';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#060b1d] via-[#0a1128] to-[#0f1535] text-slate-100 flex relative overflow-hidden">
            <div className="bg-orb-1" />
            <div className="bg-orb-2" />

            <Sidebar />

            <main className="flex-1 overflow-hidden">
                <div className="flex-1 overflow-auto">{children}</div>
            </main>
        </div>
    );
}
