'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type CreatePlanInput = {
  name: string;
  slug: string;
  monthlyPrice: number;
  deviceCap: number;
  description?: string;
  features?: any;
  isPopular?: boolean;
  isActive?: boolean;
};

export async function createPlan(input: CreatePlanInput) {
  const requestHeaders = await headers();
  try {
    await requireAdminFromHeaders(requestHeaders);
  } catch (err) {
    throw new Error('Unauthorized');
  }

  const database = prisma as any;

  await database.subscriptionPlan.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      monthlyPrice: Math.max(0, Math.floor(Number(input.monthlyPrice) || 0)),
      deviceCap: Math.max(0, Math.floor(Number(input.deviceCap) || 0)),
      description: input.description ?? null,
      features: input.features ?? null,
      isPopular: Boolean(input.isPopular),
      isActive: input.isActive ?? true,
    },
  });

  revalidatePath('/plans');
}
