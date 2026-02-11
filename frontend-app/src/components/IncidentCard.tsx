import { AlertTriangle, Clock, Server, Activity } from 'lucide-react';

interface IncidentCardProps {
    id: string;
    title: string;
    service: string;
    status: string;
    severity: 'Critical' | 'Major' | 'Minor';
    time: string;
    onAnalyze: () => void;
}

export function IncidentCard({ id, title, service, status, severity, time, onAnalyze }: IncidentCardProps) {
    const severityColors = {
        Critical: "text-red-400 border-red-500/20 bg-red-500/10",
        Major: "text-orange-400 border-orange-500/20 bg-orange-500/10",
        Minor: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    };

    return (
        <div className="glass-card p-6 rounded-xl flex items-center justify-between group hover:bg-slate-800/60 transition-all">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-slate-800 border border-slate-700`}>
                    <AlertTriangle className={severity === 'Critical' ? 'text-red-500' : 'text-orange-500'} />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">{title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityColors[severity]}`}>
                            {severity}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Activity size={14} /> {id}</span>
                        <span className="flex items-center gap-1"><Server size={14} /> {service}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {time}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                    {status}
                </span>
                <button
                    onClick={onAnalyze}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
                >
                    ✨ Analyze (AI)
                </button>
            </div>
        </div>
    );
}
