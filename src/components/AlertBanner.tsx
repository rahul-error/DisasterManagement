import { AlertTriangle, X, AlertCircle, Siren } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Alert } from '@/types/database';

interface AlertBannerProps {
  alerts: Alert[];
}

const severityConfig = {
  critical: {
    bg: 'bg-emergency-600',
    text: 'text-white',
    icon: <Siren className="w-5 h-5" />,
    label: 'CRITICAL ALERT',
  },
  high: {
    bg: 'bg-emergency-500',
    text: 'text-white',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'HIGH SEVERITY ALERT',
  },
  low: {
    bg: 'bg-warning-500',
    text: 'text-navy-900',
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'ADVISORY',
  },
};

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  const activeAlerts = alerts.filter((a) => a.active_status && !dismissed.has(a.id));

  useEffect(() => {
    if (currentIdx >= activeAlerts.length) {
      setCurrentIdx(0);
    }
  }, [activeAlerts.length, currentIdx]);

  if (activeAlerts.length === 0) return null;

  const alert = activeAlerts[currentIdx] ?? activeAlerts[0];
  if (!alert) return null;

  const config = severityConfig[alert.severity];

  return (
    <div
      className={`${config.bg} ${config.text} animate-slide-down`}
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="shrink-0 animate-pulse-alert">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
            {activeAlerts.length > 1 && (
              <span className="text-xs opacity-80">
                ({currentIdx + 1}/{activeAlerts.length})
              </span>
            )}
          </div>
          <p className="text-sm font-medium truncate">{alert.message}</p>
        </div>

        {activeAlerts.length > 1 && (
          <button
            onClick={() => setCurrentIdx((prev) => (prev + 1) % activeAlerts.length)}
            className="shrink-0 text-xs font-semibold underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Next
          </button>
        )}

        <button
          onClick={() => {
            const newDismissed = new Set(dismissed);
            newDismissed.add(alert.id);
            setDismissed(newDismissed);
          }}
          className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
