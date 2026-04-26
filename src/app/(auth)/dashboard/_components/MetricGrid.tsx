'use client';

import { motion } from 'framer-motion';
import { MetricCard } from '@/app/components/MetricCard';
import { 
    HeartPulseIcon, 
    ZapIcon, 
    ActivityIcon, 
    GaugeIcon, 
    WalletIcon, 
    TrendingUpIcon, 
    BellIcon 
} from 'lucide-react';

const ICON_MAP = {
    HeartPulseIcon,
    ZapIcon,
    ActivityIcon,
    GaugeIcon,
    WalletIcon,
    TrendingUpIcon,
    BellIcon
};

interface Metric {
    title: string;
    value: string | number;
    unit?: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    status: any;
    glowColor?: any;
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {metrics.map((metric, i) => {
                // Determine icon based on title or index if not provided in data
                let Icon = ZapIcon;
                if (metric.title.includes('Health')) Icon = HeartPulseIcon;
                if (metric.title.includes('Voltage')) Icon = ZapIcon;
                if (metric.title.includes('Current')) Icon = ActivityIcon;
                if (metric.title.includes('Consumption')) Icon = GaugeIcon;
                if (metric.title.includes('Bill')) Icon = WalletIcon;
                if (metric.title.includes('Peak')) Icon = TrendingUpIcon;
                if (metric.title.includes('Alerts')) Icon = BellIcon;

                return (
                    <motion.div key={i} variants={itemVariants}>
                        <MetricCard
                            title={metric.title}
                            value={metric.value}
                            unit={metric.unit}
                            icon={Icon}
                            trend={metric.trend}
                            trendValue={metric.trendValue}
                            status={metric.status}
                            glowColor={metric.glowColor || (metric.status === 'warning' ? 'amber' : (metric.title.includes('Health') ? 'cyan' : 'none'))}
                            className="h-full"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
