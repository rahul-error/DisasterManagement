import { useEffect, useState } from 'react';
import { Users, CalendarDays, Siren, TrendingUp, Loader2, AlertOctagon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { EventItem, Registration, Alert } from '@/types/database';

interface Stats {
  totalEvents: number;
  totalRegistrations: number;
  activeAlerts: number;
  totalCitizens: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [recentRegs, setRecentRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [eventsRes, regsRes, alertsRes, citizensRes] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('alerts').select('*').eq('active_status', true),
        supabase.from('profiles').select('*').eq('role', 'citizen'),
      ]);

      const events = (eventsRes.data as EventItem[]) || [];
      const regs = (regsRes.data as Registration[]) || [];
      const alerts = (alertsRes.data as Alert[]) || [];
      const citizens = citizensRes.data || [];

      setStats({
        totalEvents: events.length,
        totalRegistrations: regs.length,
        activeAlerts: alerts.length,
        totalCitizens: citizens.length,
      });
      setRecentEvents(events.slice(0, 5));
      setRecentRegs(regs.slice(0, 8));
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: CalendarDays, color: 'navy', bg: 'bg-navy-100', text: 'text-navy-700' },
    { label: 'Registrations', value: stats.totalRegistrations, icon: TrendingUp, color: 'safety', bg: 'bg-safety-100', text: 'text-safety-700' },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: Siren, color: 'emergency', bg: 'bg-emergency-100', text: 'text-emergency-700' },
    { label: 'Citizens', value: stats.totalCitizens, icon: Users, color: 'warning', bg: 'bg-warning-100', text: 'text-warning-700' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-sm text-navy-500 mt-1">Overview of your disaster management programmes.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5 animate-fade-in">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.text}`} />
            </div>
            <div className="text-2xl font-bold text-navy-900">{stat.value}</div>
            <div className="text-xs text-navy-500 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent events */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900 text-base mb-4">Recent Events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-navy-400 py-6 text-center">No events created yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 py-2 border-b border-navy-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{event.title}</p>
                    <p className="text-xs text-navy-500">{event.type} • {event.date}</p>
                  </div>
                  <span className="text-xs font-medium text-navy-600 bg-navy-100 px-2 py-1 rounded-full whitespace-nowrap">
                    {event.location || 'TBA'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent registrations */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900 text-base mb-4">Recent Registrations</h2>
          {recentRegs.length === 0 ? (
            <p className="text-sm text-navy-400 py-6 text-center">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRegs.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between gap-3 py-2 border-b border-navy-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate font-mono">{reg.qr_code}</p>
                    <p className="text-xs text-navy-500">
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    reg.status === 'attended'
                      ? 'bg-safety-100 text-safety-700'
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active alerts warning */}
      {stats.activeAlerts > 0 && (
        <div className="mt-6 card bg-emergency-50 ring-emergency-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emergency-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-white animate-pulse-alert" />
          </div>
          <div>
            <p className="font-bold text-emergency-900 text-sm">
              {stats.activeAlerts} active alert{stats.activeAlerts > 1 ? 's' : ''} broadcast to citizens
            </p>
            <p className="text-xs text-emergency-700">Manage alerts from the Alerts page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
