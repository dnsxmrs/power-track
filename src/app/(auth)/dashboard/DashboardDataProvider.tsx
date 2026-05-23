'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useDashboardData, DashboardDataState } from './useDashboardData';

const DashboardDataContext = createContext<{ dashboard: DashboardDataState } | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
    const { dashboard } = useDashboardData();

    return (
        <DashboardDataContext.Provider value={{ dashboard }}>
            {children}
        </DashboardDataContext.Provider>
    );
}

export function useDashboardContext() {
    const context = useContext(DashboardDataContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardDataProvider');
    }
    return context;
}
