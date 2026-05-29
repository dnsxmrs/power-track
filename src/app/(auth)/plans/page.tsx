'use client';

import { useCallback, useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { AddPlanModal } from './components/addplan';
import { EditPlanModal } from './components/editplan';
import { DeletePlanModal } from './components/deleteplan';
import {
  fetchPlansForManagement,
  type PlanManagementItem,
} from '../../_actions/plans/getplans';
import { createPlan, type CreatePlanInput } from '../../_actions/plans/addplan';
import { updatePlan, type UpdatePlanInput } from '../../_actions/plans/editplan';
import { deletePlan } from '../../_actions/plans/deleteplan';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanManagementItem | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  const refreshPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchPlansForManagement();
      setPlans(items);
    } catch {
      // swallow for now, page will show empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
		void Promise.resolve().then(() => refreshPlans());
  }, [refreshPlans]);

  const handleCreate = async (data: CreatePlanInput) => {
    await createPlan(data);
    setIsAddOpen(false);
    await refreshPlans();
  };

  const handleEdit = async (planId: string, data: UpdatePlanInput) => {
    await updatePlan(planId, data);
    setIsEditOpen(false);
    setSelectedPlan(null);
    await refreshPlans();
  };

  const handleDelete = async (planId: string) => {
    setIsProcessingDelete(true);
    try {
      await deletePlan(planId);
      setIsDeleteOpen(false);
      setSelectedPlan(null);
      await refreshPlans();
    } finally {
      setIsProcessingDelete(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Plans</h1>
          <p className="text-slate-400">Manage subscription plans</p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <GlassCard className="p-6">Loading...</GlassCard>
        ) : plans.length === 0 ? (
          <GlassCard className="p-6">No plans configured.</GlassCard>
        ) : (
          plans.map(plan => (
            <GlassCard key={plan.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{plan.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{plan.description ?? ''}</p>
                  <div className="mt-3 text-sm text-slate-300">
                    <div>Price: ₱{plan.monthlyPrice}</div>
                    <div>Device cap: {plan.deviceCap}</div>
                    <div>Slug: {plan.slug}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => { setSelectedPlan(plan); setIsEditOpen(true); }} className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400">Edit</button>
                  <button onClick={() => { setSelectedPlan(plan); setIsDeleteOpen(true); }} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400">Disable</button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <AddPlanModal key={isAddOpen ? 'open' : 'closed'} isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleCreate} />

      <EditPlanModal
        key={`${selectedPlan?.id ?? 'none'}-${isEditOpen ? 'open' : 'closed'}`}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedPlan(null); }}
        plan={selectedPlan}
        onSubmit={handleEdit}
      />

      <DeletePlanModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedPlan(null); }}
        plan={selectedPlan ? { id: selectedPlan.id, name: selectedPlan.name } : null}
        onConfirm={handleDelete}
        isLoading={isProcessingDelete}
      />
    </div>
  );
}
