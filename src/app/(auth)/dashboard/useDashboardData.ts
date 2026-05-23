'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/app/_actions/dashboard';
import type { DashboardData } from '@/app/types/dashboard';

export type DashboardDataState =
    | {
        status: 'loading';
        data: null;
        error: null;
    }
    | {
        status: 'error';
        data: null;
        error: string;
    }
    | {
        status: 'success';
        data: DashboardData;
        error: null;
    };

export function useDashboardData() {
    const [dashboard, setDashboard] = useState<DashboardDataState>({
        status: 'loading',
        data: null,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await getDashboardData();
                if (!cancelled) {
                    setDashboard({ status: 'success', data, error: null });
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Unable to load dashboard telemetry right now.';
                    setDashboard({ status: 'error', data: null, error: message });
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { dashboard, setDashboard };
}
