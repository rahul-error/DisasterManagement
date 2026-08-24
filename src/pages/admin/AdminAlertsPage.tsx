import { useEffect, useState, FormEvent } from 'react';
import { Siren, Loader2, Plus, X, AlertTriangle, AlertOctagon, Info, Power, PowerOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Alert, AlertSeverity } from '@/types/database';

const severityConfig: Record<AlertSeverity, { label: string; icon: typeof AlertTriangle; bg: string; text: string; ring: string }> = {
  critical: { label: 'Critical', icon: AlertOctagon, bg: 'bg-emergency-100', text: 'text-emergency-700', ring: 'ring-emergency-300' },
  high: { label: 'High', icon: AlertTriangle, bg: 'bg-emergency-50', text: 'text-emergency-600', ring: 'ring-emergency-200' },
  low: { label: 'Low', icon: Info, bg: 'bg-warning-100', text: 'text-warning-700', ring: 'ring-warning-300' },
};

export function AdminAlertsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [severity, setSeverity] = useState<AlertSeverity>('high');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function loadAlerts() {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    setAlerts((data as Alert[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from('alerts').insert({
      severity,
      message,
      active_status: true,
      created_by: user?.id,
    });
    if (error) {
      showToast('Failed to send alert.', 'error');
    } else {
      showToast('Emergency broadcast sent to all citizens.', 'success');
      setMessage('');
      setSeverity('high');
      setShowForm(false);
      loadAlerts();
    }
    setSending(false);
  };

  const toggleActive = async (alert: Alert) => {
    const { error } = await supabase
      .from('alerts')
      .update({ active_status: !alert.active_status })
      .eq('id', alert.id);
    if (error) {
      showToast('Failed to update alert.', 'error');
    } else {
      showToast(`Alert ${!alert.active_status ? 'activated' : 'deactivated'}.`, 'success');
      loadAlerts();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.active_status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Early Warning System</h1>
          <p className="text-sm text-navy-500 mt-1">Compose and broadcast emergency alerts to citizens.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-emergency">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Alert</span>
        </button>
      </div>

      {/* Active alerts banner */}
      {activeAlerts.length > 0 && (
        <div className="card bg-emergency-600 text-white p-4 mb-6 flex items-center gap-3 animate-pulse-alert">
          <Siren className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            {activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''} currently visible to all citizens.
          </p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-lg">Send Emergency Broadcast</h2>
              <button onClick={() => setShowForm(false)} className="text-navy-400 hover:text-navy-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(severityConfig) as AlertSeverity[]).map((sev) => {
                    const config = severityConfig[sev];
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                          severity === sev ? `border-current ${config.bg} ${config.text}` : 'border-navy-200 bg-white text-navy-400 hover:border-navy-300'
                        }`}
                      >
                        <config.icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Alert Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field min-h-[100px] resize-y"
                  placeholder="e.g. Flash flood warning for low-lying areas near Yamuna river. Evacuate immediately to higher ground."
                />
              </div>

              <div className="bg-emergency-50 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-emergency-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emergency-700">
                  This alert will be immediately visible to all citizens as a banner at the top of their screen.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={sending} className="btn-emergency flex-1">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Siren className="w-4 h-4" /> Broadcast Alert</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert history */}
      {alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <Siren className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No alerts sent yet</p>
          <p className="text-sm text-navy-400 mt-1">Create an alert to broadcast to citizens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`card p-4 flex items-start gap-4 ring-1 ${alert.active_status ? config.ring : 'ring-navy-100'} animate-fade-in`}
              >
                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <config.icon className={`w-5 h-5 ${config.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold uppercase ${config.text}`}>{config.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      alert.active_status
                        ? 'bg-safety-100 text-safety-700'
                        : 'bg-navy-100 text-navy-500'
                    }`}>
                      {alert.active_status ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-navy-400">
                      {new Date(alert.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-navy-700">{alert.message}</p>
                </div>

                <button
                  onClick={() => toggleActive(alert)}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    alert.active_status
                      ? 'text-emergency-600 hover:bg-emergency-50'
                      : 'text-safety-600 hover:bg-safety-50'
                  }`}
                  title={alert.active_status ? 'Deactivate alert' : 'Reactivate alert'}
                >
                  {alert.active_status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
