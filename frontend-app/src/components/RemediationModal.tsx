import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertOctagon, Terminal, Play } from 'lucide-react';
import useSWRMutation from 'swr/mutation';

async function fetchAnalysis(url: string, { arg }: { arg: any }) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
    });
    return response.json();
}

async function executeRemediation(url: string, { arg }: { arg: any }) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
    });
    return response.json();
}

interface RemediationModalProps {
    isOpen: boolean;
    onClose: () => void;
    incident: any;
}

export function RemediationModal({ isOpen, onClose, incident }: RemediationModalProps) {
    const { trigger: analyze, data: analysis, isMutating: isAnalyzing } = useSWRMutation('http://localhost:8000/api/v1/analyze', fetchAnalysis);
    const { trigger: remediate, data: remediationResult, isMutating: isRemediating } = useSWRMutation('http://localhost:8000/api/v1/execute-remediation', executeRemediation);

    useEffect(() => {
        if (isOpen && incident) {
            analyze({
                id: incident.id,
                title: incident.title,
                service: incident.service,
                description: incident.title, // utilizing title as description for now
                logs: ["Error: Connection timeout", "Latency > 5000ms"], // Mock logs
            });
        }
    }, [isOpen, incident, analyze]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            ✨ Gemini Intelligence Analysis
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Analyzing {incident?.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 animate-pulse">Consulting Gemini knowledge base...</p>
                        </div>
                    ) : analysis ? (
                        <>
                            {/* RCA Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-red-400 mb-2">
                                    <AlertOctagon size={18} />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Root Cause Analysis</h3>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                                    {analysis.root_cause_analysis}
                                </div>
                            </div>

                            {/* Fix Code Section */}
                            {analysis.suggested_code_fix && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <Terminal size={18} />
                                        <h3 className="font-semibold uppercase tracking-wider text-xs">Suggested Code Fix</h3>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-green-400 overflow-x-auto">
                                        <pre>{analysis.suggested_code_fix}</pre>
                                    </div>
                                </div>
                            )}

                            {/* Remediation Action */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-400 mb-2">
                                    <CheckCircle size={18} />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Recommended Action</h3>
                                </div>
                                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-white">Automated Remediation</h4>
                                        <p className="text-slate-400 text-sm mt-1">{analysis.automation_suggestion}</p>
                                    </div>
                                    <button
                                        onClick={() => remediate({
                                            action_id: "restart_service",
                                            target: { cluster: "dev-cluster", service: incident.service + "-service" } // naive mapping
                                        })}
                                        disabled={isRemediating || remediationResult}
                                        className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${remediationResult
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default'
                                                : 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10'
                                            }`}
                                    >
                                        {isRemediating ? (
                                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                        ) : remediationResult ? (
                                            <>
                                                <CheckCircle size={16} />
                                                Executed
                                            </>
                                        ) : (
                                            <>
                                                <Play size={16} fill="currentColor" />
                                                Execute Fix
                                            </>
                                        )}
                                    </button>
                                </div>
                                {remediationResult && (
                                    <div className="mt-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800 font-mono text-xs text-slate-400">
                                        Response: {JSON.stringify(remediationResult, null, 2)}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-red-400 py-8">Analysis failed to load.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
