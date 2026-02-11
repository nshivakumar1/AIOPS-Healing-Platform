import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ReactNode;
    color: string;
}

export function StatCard({ title, value, trend, trendUp, icon, color }: StatCardProps) {
    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl select-none ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{trend}</span>
                    <span className="text-slate-500">vs last hour</span>
                </div>
            </div>
        </div>
    );
}
