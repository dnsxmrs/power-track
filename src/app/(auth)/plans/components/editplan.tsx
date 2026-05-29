'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plan?: {
    id: string;
    name: string;
    slug: string;
    monthlyPrice: number;
    deviceCap: number;
    description?: string | null;
    features?: unknown;
    isPopular?: boolean;
    isActive?: boolean;
  } | null;
  onSubmit: (planId: string, data: {
    name: string;
    slug: string;
    monthlyPrice: number;
    deviceCap: number;
    description?: string;
    features?: string[];
    isPopular?: boolean;
    isActive?: boolean;
  }) => void;
};

export function EditPlanModal({ isOpen, onClose, plan, onSubmit }: Props) {
  const featuresText = Array.isArray(plan?.features)
    ? plan.features.join(', ')
    : typeof plan?.features === 'string'
      ? plan.features
      : '';
  const [name, setName] = useState(() => plan?.name ?? '');
  const [slug, setSlug] = useState(() => plan?.slug ?? '');
  const [monthlyPrice, setMonthlyPrice] = useState(() => String(plan?.monthlyPrice ?? 0));
  const [deviceCap, setDeviceCap] = useState(() => String(plan?.deviceCap ?? 0));
  const [description, setDescription] = useState(() => plan?.description ?? '');
  const [features, setFeatures] = useState(() => featuresText);
  const [isPopular, setIsPopular] = useState(() => Boolean(plan?.isPopular));
  const [isActive, setIsActive] = useState(() => Boolean(plan?.isActive ?? true));

  if (!isOpen || !plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(plan.id, {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      monthlyPrice: Number(monthlyPrice) || 0,
      deviceCap: Number(deviceCap) || 0,
      description: description || undefined,
      features: features ? features.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      isPopular,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.form
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-lg p-6"
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Edit Plan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Plan name" className="px-3 py-2 bg-white/5 rounded-lg" />
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug (optional)" className="px-3 py-2 bg-white/5 rounded-lg" />
          <input value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="Monthly price" type="number" className="px-3 py-2 bg-white/5 rounded-lg" />
          <input value={deviceCap} onChange={e => setDeviceCap(e.target.value)} placeholder="Device cap" type="number" className="px-3 py-2 bg-white/5 rounded-lg" />
        </div>

        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full mt-3 p-3 bg-white/5 rounded-lg" />

        <input value={features} onChange={e => setFeatures(e.target.value)} placeholder="Features (comma separated)" className="w-full mt-3 px-3 py-2 bg-white/5 rounded-lg" />

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
            Mark as popular
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400">Save</button>
        </div>
      </motion.form>
    </div>
  );
}
