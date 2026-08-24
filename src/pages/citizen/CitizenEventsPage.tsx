import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, CheckCircle2, Loader2, School, HeartPulse, Activity, CalendarClock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { EventItem, Registration } from '@/types/database';

const typeConfig = {
  'SSP': { label: 'School Safety Programme', icon: School, color: 'navy', bg: 'bg-navy-100', text: 'text-navy-700' },
  'CAP': { label: 'Community Awareness', icon: HeartPulse, color: 'safety', bg: 'bg-safety-100', text: 'text-safety-700' },
  'Mock Drill': { label: 'Mock Drill Exercise', icon: Activity, color: 'warning', bg: 'bg-warning-100', text: 'text-warning-700' },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function CitizenEventsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Map<string, Registration>>(new Map());
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'SSP' | 'CAP' | 'Mock Drill'>('all');

  useEffect(() => {
    async function loadData() {
      const [{ data: eventsData }, { data: regData }] = await Promise.all([
        supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date'),
        user ? supabase.from('registrations').select('*').eq('user_id', user.id) : Promise.resolve({ data: null }),
      ]);

      setEvents((eventsData as EventItem[]) || []);
      const regMap = new Map<string, Registration>();
      (regData as Registration[] | null)?.forEach((r) => regMap.set(r.event_id, r));
      setRegistrations(regMap);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleRegister = async (event: EventItem) => {
    if (!user) return;
    setRegistering(event.id);
    const qrValue = `DR-${event.id.slice(0, 8).toUpperCase()}-${user.id.slice(0, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
        event_id: event.id,
        status: 'registered',
        qr_code: qrValue,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        showToast('You are already registered for this event.', 'warning');
      } else {
        showToast('Failed to register. Please try again.', 'error');
      }
    } else {
      setRegistrations(new Map(registrations).set(event.id, data as Registration));
      showToast(`Registered for "${event.title}"! Check your tickets for the QR code.`, 'success');
    }
    setRegistering(null);
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Upcoming Programmes</h1>
        <p className="text-sm text-navy-500 mt-1">Browse and register for safety drills and awareness events near you.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {([
          { key: 'all', label: 'All' },
          { key: 'SSP', label: 'School Safety' },
          { key: 'CAP', label: 'Community' },
          { key: 'Mock Drill', label: 'Mock Drills' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-navy-900 text-white'
                : 'bg-white text-navy-600 ring-1 ring-inset ring-navy-200 hover:bg-navy-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No upcoming events</p>
          <p className="text-sm text-navy-400 mt-1">Check back later for new programmes.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredEvents.map((event) => {
            const config = typeConfig[event.type];
            const reg = registrations.get(event.id);
            return (
              <div key={event.id} className="card p-5 flex flex-col animate-fade-in">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </div>
                </div>

                <h3 className="font-bold text-navy-900 text-base leading-snug mb-3">{event.title}</h3>

                <div className="space-y-1.5 text-sm text-navy-600 mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-navy-400 shrink-0" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-navy-400 shrink-0" />
                    {event.location || 'Location TBA'}
                  </div>
                  {event.description && (
                    <p className="text-navy-500 text-sm mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>

                {reg ? (
                  <div className="flex items-center gap-2 text-safety-700 bg-safety-50 rounded-lg px-3 py-2.5 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Registered — view ticket
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(event)}
                    disabled={registering === event.id}
                    className="btn-safety w-full"
                  >
                    {registering === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Register Now
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
