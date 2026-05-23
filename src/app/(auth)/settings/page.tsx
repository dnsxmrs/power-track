import { getSettings } from '@/app/_actions/settings/getsettings';
import { createSettings } from '@/app/_actions/settings/createsettings';
import { updateSettings } from '@/app/_actions/settings/updatesettings';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge } from '../../components/StatusBadge';

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		maximumFractionDigits: 2,
	}).format(value);
}

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SettingsPage({ searchParams }: Props) {
	const error = searchParams.error as string | undefined;

	const settings = await getSettings();
	const isCreating = !settings;

	return (
		<div className="max-w-3xl mx-auto space-y-6 pb-12 p-6">
			{error && (
				<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
					{error}
				</div>
			)}
			<div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
					<p className="text-slate-400 mt-1">Manage the electricity price used by admin reports.</p>
				</div>
				<StatusBadge status={isCreating ? 'warning' : 'normal'} label={isCreating ? 'Needs setup' : 'Configured'} />
			</div>

			<GlassCard>
				<div className="mb-6 pb-4 border-b border-white/8">
					<h2 className="text-lg font-semibold text-white">Electricity Pricing</h2>
					<p className="text-sm text-slate-400 mt-1">Store a single price per kilowatt-hour in pesos.</p>
				</div>

				{isCreating ? (
					<form action={createSettings} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="pricePerKilowattHour">
								Price per kWh (PHP)
							</label>
							<div className="inline-flex w-full items-center bg-white/4 border border-white/10 rounded-lg overflow-hidden">
								<span className="px-3 text-slate-300 bg-transparent">₱</span>
								<input
									id="pricePerKilowattHour"
									name="pricePerKilowattHour"
									type="number"
									step="0.01"
									min="0"
									required
									placeholder="0.00"
									className="glass-input flex-1 min-w-0 bg-transparent px-4 py-2 text-white outline-none"
								/>
								<span className="px-3 text-sm text-slate-400 whitespace-nowrap">/ kWh</span>
							</div>
						</div>
						<button className="px-6 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-white font-medium rounded-lg transition-colors" type="submit">
							Create Settings
						</button>
					</form>
				) : (
					<form action={updateSettings.bind(null, settings.id)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="pricePerKilowattHour">
									Price per kWh (PHP)
								</label>
								<div className="inline-flex w-full items-center bg-white/4 border border-white/10 rounded-lg overflow-hidden">
									<span className="px-3 text-slate-300 bg-transparent">₱</span>
									<input
										id="pricePerKilowattHour"
										name="pricePerKilowattHour"
										type="number"
										step="0.01"
										min="0"
										required
										defaultValue={settings.pricePerKilowattHour}
										className="glass-input flex-1 min-w-0 bg-transparent px-4 py-2 text-white outline-none"
									/>
									<span className="px-3 text-sm text-slate-400 whitespace-nowrap">/ kWh</span>
								</div>
							</div>
							<div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
								<p className="font-medium text-white">Current value</p>
								<p className="mt-1 text-slate-400">{formatCurrency(settings.pricePerKilowattHour)} per kWh</p>
								<div className="mt-3 text-xs text-slate-500">
									<p>Example estimate:</p>
									<p className="font-medium mt-1">100 kWh = {formatCurrency(settings.pricePerKilowattHour * 100)}</p>
								</div>
							</div>
						</div>
						<button className="px-6 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] text-white font-medium rounded-lg transition-colors" type="submit">
							Save Changes
						</button>
					</form>
				)}
			</GlassCard>
		</div>
	);
}
