interface ActivityItemProps {
    title: string;
    desc: string;
    time: string;
    type: 'success' | 'error' | 'warning';
}

export function ActivityItem({ title, desc, time, type }: ActivityItemProps) {
    const borderColor = type === 'success' ? 'border-green-500 bg-green-500/20' :
        type === 'error' ? 'border-red-500 bg-red-500/20' : 'border-yellow-500 bg-yellow-500/20';

    return (
        <div className="relative pl-8">
            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${borderColor}`} />
            <h4 className="text-sm font-medium text-slate-200">{title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">{time}</span>
        </div>
    );
}
