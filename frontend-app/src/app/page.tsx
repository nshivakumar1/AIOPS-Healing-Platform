"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { StatCard } from '@/components/StatCard';
import { IncidentCard } from '@/components/IncidentCard';
import { ActivityItem } from '@/components/ActivityItem';
import { RemediationModal } from '@/components/RemediationModal';
import { Activity, Heart, Zap, Cloud } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: incidents, error } = useSWR('http://localhost:8000/api/v1/incidents', fetcher);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = (incident: any) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const isLoading = !incidents && !error;
  const activeIncidentsCount = incidents?.length || 0;

  return (
    <div className="space-y-8 min-h-screen bg-slate-950 text-slate-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            System Overview
          </h2>
          <p className="text-slate-400 mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-sm font-medium transition-colors">
            Refresh Data
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 text-sm font-medium transition-colors">
            + New Incident
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Incidents"
          value={activeIncidentsCount.toString()}
          trend={activeIncidentsCount > 0 ? "+1" : "0"}
          trendUp={activeIncidentsCount === 0}
          icon={<Activity />}
          color="text-red-400"
        />
        <StatCard title="System Health" value="98.2%" trend="-0.4%" trendUp={false} icon={<Heart />} color="text-green-400" />
        <StatCard title="Auto-Healed" value="14" trend="+3" trendUp={true} icon={<Zap />} color="text-blue-400" />
        <StatCard title="Services Online" value="45/45" trend="stable" trendUp={true} icon={<Cloud />} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Incidents List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-200">Active Incidents</h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500">Loading incidents...</div>
            ) : incidents && incidents.length > 0 ? (
              incidents.map((incident: any) => (
                <IncidentCard
                  key={incident.id}
                  id={incident.id}
                  title={incident.title}
                  service={incident.service}
                  status={incident.status}
                  severity={incident.severity}
                  time="Just now" // Mock time for now
                  onAnalyze={() => handleAnalyze(incident)}
                />
              ))
            ) : (
              <div className="p-8 border border-slate-800 rounded-xl text-center text-slate-500 bg-slate-900/50">
                No active incidents. System is healthy.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-200">Recent Activity</h3>
          <div className="glass-panel rounded-xl p-6 h-full min-h-[300px] border border-slate-800 bg-slate-900/50">
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              <ActivityItem
                title="Auto-scaled ECS Cluster"
                desc="Triggered by high CPU usage"
                time="10m ago"
                type="success"
              />
              <ActivityItem
                title="Restarted Redis Cache"
                desc="Healed connection timeout"
                time="32m ago"
                type="success"
              />
              <ActivityItem
                title="Deployment Failed"
                desc="Rollback initiated for v2.4.1"
                time="1h ago"
                type="error"
              />
            </div>
          </div>
        </div>
      </div>

      <RemediationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incident={selectedIncident}
      />
    </div>
  );
}
