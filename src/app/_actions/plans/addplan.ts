'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireAdminFromHeaders } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export type CreatePlanInput = {
  name: string;
  slug: string;
  monthlyPrice: number;
  deviceCap: number;
  description?: string;
  features?: Prisma.InputJsonValue | null;
  isPopular?: boolean;
  isActive?: boolean;
};

export async function createPlan(input: CreatePlanInput) {
  const requestHeaders = await headers();
  try {
    await requireAdminFromHeaders(requestHeaders);
  } catch {
    throw new Error('Unauthorized');
  }

  await prisma.subscriptionPlan.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      monthlyPrice: Math.max(0, Math.floor(Number(input.monthlyPrice) || 0)),
      deviceCap: Math.max(0, Math.floor(Number(input.deviceCap) || 0)),
      description: input.description ?? null,
      features:
        input.features === undefined
          ? undefined
          : input.features === null
          ? Prisma.JsonNull
          : (input.features as Prisma.InputJsonValue),
      isPopular: Boolean(input.isPopular),
      isActive: input.isActive ?? true,
    },
  });

  revalidatePath('/plans');
}
