"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MailIcon, PhoneIcon, UserIcon, Building2Icon, FileTextIcon, Layers3Icon, HashIcon, PlusIcon } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';

export type AddApplicationFormData = {
	fullName: string;
	email: string;
	phoneNumber: string;
	planSlug: string;
	deviceCount: number;
	branches: Array<{ name: string; city?: string; province?: string; address?: string; notes?: string }>;
	specialRequirements: string;
	proofOfBillingFile: File;
	validIdFrontFile: File;
	validIdBackFile: File;
};

interface AddApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (applicationData: AddApplicationFormData) => void;
	isSubmitting?: boolean;
	planOptions: Array<{ slug: string; name: string }>;
}

const DEFAULT_FORM: AddApplicationFormData = {
	fullName: '',
	email: '',
	phoneNumber: '',
	planSlug: '',
	deviceCount: 1,
	branches: [{ name: '', city: '', province: '', address: '', notes: '' }],
	specialRequirements: '',
	proofOfBillingFile: undefined as unknown as File,
	validIdFrontFile: undefined as unknown as File,
	validIdBackFile: undefined as unknown as File,
};

// Plan options will be fetched from the server

export function AddApplicationModal({ isOpen, onClose, onSubmit, isSubmitting = false, planOptions }: AddApplicationModalProps) {
	const [formData, setFormData] = useState<AddApplicationFormData>(DEFAULT_FORM);
	const [phoneDigits, setPhoneDigits] = useState('');
	const [proofOfBillingFileName, setProofOfBillingFileName] = useState('No file selected');
	const [validIdFrontFileName, setValidIdFrontFileName] = useState('No file selected');
	const [validIdBackFileName, setValidIdBackFileName] = useState('No file selected');

	// keep hooks stable — render nothing visually when closed but keep hooks mounted
	if (!isOpen) return null;

	const updateField = <K extends keyof AddApplicationFormData>(field: K, value: AddApplicationFormData[K]) => {
		setFormData(current => ({ ...current, [field]: value }));
	};

	const updateBranch = (index: number, key: 'name' | 'city' | 'province' | 'address' | 'notes', value: string) => {
		setFormData(current => {
			const branches = [...current.branches];
			branches[index] = { ...branches[index], [key]: value };
			return { ...current, branches };
		});
	};

	const addBranch = () => {
		setFormData(current => ({ ...current, branches: [...current.branches, { name: '', city: '', province: '', address: '', notes: '' }] }));
	};

	const removeBranch = (index: number) => {
		setFormData(current => ({ ...current, branches: current.branches.filter((_, i) => i !== index) }));
	};


	const formatPhoneDigitsForInput = (digits: string): string => {
		if (digits.length <= 3) {
			return digits;
		}

		if (digits.length <= 6) {
			return `${digits.slice(0, 3)} ${digits.slice(3)}`;
		}

		return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
	};

	const handlePhoneDigitChange = (value: string) => {
		const digits = value.replace(/\D/g, '').slice(0, 10);
		setPhoneDigits(digits);
		updateField('phoneNumber', `+63${digits}`);
	};

	const handleFileChange = (field: 'proofOfBillingFile' | 'validIdFrontFile' | 'validIdBackFile', file: File | null) => {
		if (!file) {
			return;
		}

		updateField(field, file);

		if (field === 'proofOfBillingFile') {
			setProofOfBillingFileName(file.name);
		}

		if (field === 'validIdFrontFile') {
			setValidIdFrontFileName(file.name);
		}

		if (field === 'validIdBackFile') {
			setValidIdBackFileName(file.name);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await onSubmit(formData);
		setFormData(DEFAULT_FORM);
		setProofOfBillingFileName('No file selected');
		setValidIdFrontFileName('No file selected');
		setValidIdBackFileName('No file selected');
	};

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
			<motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<GlassCard glowColor="cyan" className="w-full max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Create application</p>
							<h2 className="text-2xl font-bold text-white">Add New Application</h2>
						</div>
						<button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200" aria-label="Close add application modal">
							<X size={20} />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<label className="space-y-2 md:col-span-2">
								<span className="flex items-center gap-2 text-sm text-slate-300"><UserIcon size={16} className="text-cyan-300" />Full Name</span>
								<input value={formData.fullName} onChange={event => updateField('fullName', event.target.value)} required placeholder="Business contact name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8" />
							</label>

							<label className="space-y-2">
								<span className="flex items-center gap-2 text-sm text-slate-300"><MailIcon size={16} className="text-cyan-300" />Email Address</span>
								<input value={formData.email} onChange={event => updateField('email', event.target.value)} required type="email" placeholder="client@company.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8" />
							</label>

							<label className="space-y-2">
								<span className="flex items-center gap-2 text-sm text-slate-300"><PhoneIcon size={16} className="text-cyan-300" />Phone Number</span>
								<div className="flex gap-2">
									<div className="flex items-center px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 font-medium">
										+63
									</div>
									<input
										type="tel"
										inputMode="numeric"
										value={formatPhoneDigitsForInput(phoneDigits)}
										onChange={event => handlePhoneDigitChange(event.target.value)}
										required
										placeholder="917 123 4567"
										maxLength={12}
										className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
									/>
								</div>
							</label>

							<label className="space-y-2">
								<span className="flex items-center gap-2 text-sm text-slate-300"><Layers3Icon size={16} className="text-cyan-300" />Plan</span>
								<select value={formData.planSlug} onChange={event => updateField('planSlug', event.target.value as string)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-white/8">
									<option value="">Select a plan</option>
									{planOptions.map(option => (
										<option key={option.slug} value={option.slug} className="bg-slate-950">{option.name}</option>
									))}
								</select>
							</label>

							<label className="space-y-2">
								<span className="flex items-center gap-2 text-sm text-slate-300"><HashIcon size={16} className="text-cyan-300" />Device Count</span>
								<input value={formData.deviceCount} onChange={event => updateField('deviceCount', Number(event.target.value) || 1)} required min={1} type="number" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-white/8" />
							</label>

							<div className="md:col-span-2">
								<div className="flex items-center justify-between mb-2">
									<span className="flex items-center gap-2 text-sm text-slate-300"><Building2Icon size={16} className="text-cyan-300" />Branches</span>
									<button type="button" onClick={addBranch} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-sm">
										<PlusIcon size={14} /> Add branch
									</button>
								</div>
								<div className="space-y-3">
									{formData.branches.map((b, idx) => (
										<div key={idx} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
											<div className="space-y-2">
												<span className="text-xs uppercase tracking-[0.18em] text-slate-500">Branch {idx + 1}</span>
												<input
													value={b.name}
													onChange={e => updateBranch(idx, 'name', e.target.value)}
													required
													placeholder="Branch or office name"
													className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
												/>
											</div>
											<div className="grid gap-3 md:grid-cols-2">
												<input
													value={b.city}
													onChange={e => updateBranch(idx, 'city', e.target.value)}
													placeholder="City"
													className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
												/>
												<input
													value={b.province ?? ''}
													onChange={e => updateBranch(idx, 'province', e.target.value)}
													placeholder="Province"
													className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
												/>
											</div>
											<div className="grid gap-3 md:grid-cols-2">
												<input
													value={b.address ?? ''}
													onChange={e => updateBranch(idx, 'address', e.target.value)}
													placeholder="Address"
													className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
												/>
												<input
													value={b.notes ?? ''}
													onChange={e => updateBranch(idx, 'notes', e.target.value)}
													placeholder="Branch notes"
													className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
												/>
												{formData.branches.length > 1 && (
													<button type="button" onClick={() => removeBranch(idx)} className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 transition hover:bg-red-500/15">
														Remove
													</button>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						<label className="space-y-2 block">
							<span className="flex items-center gap-2 text-sm text-slate-300"><FileTextIcon size={16} className="text-cyan-300" />Special Requirements</span>
							<textarea value={formData.specialRequirements} onChange={event => updateField('specialRequirements', event.target.value)} rows={4} placeholder="Optional notes, delivery instructions, or review context" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8" />
						</label>

						<div className="grid gap-4 md:grid-cols-3">
							<label className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
								<span className="flex items-center gap-2 text-sm text-slate-300"><FileTextIcon size={16} className="text-cyan-300" />Proof of Billing</span>
								<input type="file" accept=".pdf,image/*" required onChange={event => handleFileChange('proofOfBillingFile', event.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-2 file:text-cyan-200 hover:file:bg-cyan-500/15" />
								<p className="text-xs text-slate-500 break-words">{proofOfBillingFileName}</p>
							</label>

							<label className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
								<span className="flex items-center gap-2 text-sm text-slate-300"><FileTextIcon size={16} className="text-cyan-300" />Valid ID Front</span>
								<input type="file" accept="image/*,.pdf" required onChange={event => handleFileChange('validIdFrontFile', event.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-2 file:text-cyan-200 hover:file:bg-cyan-500/15" />
								<p className="text-xs text-slate-500 break-words">{validIdFrontFileName}</p>
							</label>

							<label className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
								<span className="flex items-center gap-2 text-sm text-slate-300"><FileTextIcon size={16} className="text-cyan-300" />Valid ID Back</span>
								<input type="file" accept="image/*,.pdf" required onChange={event => handleFileChange('validIdBackFile', event.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-2 file:text-cyan-200 hover:file:bg-cyan-500/15" />
								<p className="text-xs text-slate-500 break-words">{validIdBackFileName}</p>
							</label>
						</div>

						<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10" disabled={isSubmitting}>
								Cancel
							</button>
							<button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60">
								<PlusIcon size={16} />
								{isSubmitting ? 'Creating...' : 'Create Application'}
							</button>
						</div>
					</form>
				</GlassCard>
			</motion.div>
		</>
	);
}