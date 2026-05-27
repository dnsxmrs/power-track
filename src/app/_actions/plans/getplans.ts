'use server';

import { headers } from 'next/headers';
import { requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type PlanManagementItem = {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  deviceCap: number;
  description?: string | null;
  features?: any | null;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchPlansForManagement(): Promise<PlanManagementItem[]> {
  const requestHeaders = await headers();
  await requireAdminFromHeaders(requestHeaders);

  const database = prisma as any;
  const plans = await database.subscriptionPlan.findMany({ orderBy: { createdAt: 'desc' } });

  return plans.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    monthlyPrice: p.monthlyPrice,
    deviceCap: p.deviceCap,
    description: p.description,
    features: p.features ?? null,
    isPopular: Boolean(p.isPopular),
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}
