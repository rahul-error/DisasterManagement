import { useEffect, useState } from 'react';
import { QrCode, CalendarDays, MapPin, Loader2, Ticket, CalendarClock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MockQRCode } from '@/components/MockQRCode';
import type { Registration, EventItem } from '@/types/database';

interface TicketData {
  registration: Registration;
  event: EventItem;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketData | null>(null);

  useEffect(() => {
    async function loadTickets() {
      if (!user) return;
      const { data } = await supabase
        .from('registrations')
        .select('*, event:events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const ticketData = ((data as unknown as Array<{ registration: Registration; event: EventItem }>) || [])
        .map((row) => ({
          registration: row as unknown as Registration,
          event: (row as unknown as { event: EventItem }).event,
        }))
        .filter((t) => t.event) as TicketData[];

      setTickets(ticketData);
      setLoading(false);
    }
    loadTickets();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">My Tickets</h1>
        <p className="text-sm text-navy-500 mt-1">Your registered events with QR codes for check-in.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="card p-12 text-center">
          <Ticket className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No tickets yet</p>
          <p className="text-sm text-navy-400 mt-1">Register for an event to get your QR ticket.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <button
              key={ticket.registration.id}
              onClick={() => setSelected(ticket)}
              className="card p-5 text-left hover:shadow-md transition-shadow animate-fade-in"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-600 bg-navy-100 px-2.5 py-1 rounded-full">
                  {ticket.event.type}
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  ticket.registration.status === 'attended'
                    ? 'bg-safety-100 text-safety-700'
                    : 'bg-warning-100 text-warning-700'
                }`}>
                  {ticket.registration.status === 'attended' ? 'Attended' : 'Registered'}
                </div>
              </div>

              <h3 className="font-bold text-navy-900 text-base mb-2 leading-snug">{ticket.event.title}</h3>

              <div className="flex items-center gap-4 text-sm text-navy-600">
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-navy-400" />
                  {formatDate(ticket.event.date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-navy-400" />
                  {ticket.event.location || 'TBA'}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-navy-500 text-xs">
                <QrCode className="w-4 h-4" />
                Tap to view QR ticket
              </div>
            </button>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emergency-600 px-3 py-1 rounded-full mb-2">
                DISASTERREADY TICKET
              </div>
              <h2 className="font-bold text-navy-900 text-lg leading-snug">{selected.event.title}</h2>
            </div>

            <div className="flex justify-center mb-4">
              <MockQRCode value={selected.registration.qr_code} size={200} />
            </div>

            <div className="space-y-2 text-sm text-navy-600 bg-navy-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-navy-400" />
                {formatDate(selected.event.date)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-navy-400" />
                {selected.event.location || 'TBA'}
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-navy-400" />
                <span className="font-mono text-xs">{selected.registration.qr_code}</span>
              </div>
            </div>

            <div className={`text-center text-sm font-semibold px-3 py-2 rounded-lg ${
              selected.registration.status === 'attended'
                ? 'bg-safety-100 text-safety-700'
                : 'bg-warning-100 text-warning-700'
            }`}>
              {selected.registration.status === 'attended' ? '✓ Attended' : 'Awaiting check-in'}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="btn-ghost w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
