import { useEffect, useState, FormEvent } from 'react';
import { Plus, Loader2, Trash2, Edit2, X, CalendarDays, MapPin, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { EventItem, EventType, Registration } from '@/types/database';

const typeLabels: Record<EventType, string> = {
  'SSP': 'School Safety Programme',
  'CAP': 'Community Awareness',
  'Mock Drill': 'Mock Drill Exercise',
};

export function AdminEventsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [regsByEvent, setRegsByEvent] = useState<Map<string, Registration[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'SSP' as EventType,
    date: '',
    location: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const [eventsRes, regsRes] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: true }),
      supabase.from('registrations').select('*'),
    ]);
    setEvents((eventsRes.data as EventItem[]) || []);
    const map = new Map<string, Registration[]>();
    (regsRes.data as Registration[] | null)?.forEach((r) => {
      const list = map.get(r.event_id) || [];
      list.push(r);
      map.set(r.event_id, list);
    });
    setRegsByEvent(map);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', type: 'SSP', date: '', location: '', description: '' });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (event: EventItem) => {
    setEditing(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      location: event.location,
      description: event.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          type: formData.type,
          date: formData.date,
          location: formData.location,
          description: formData.description,
        })
        .eq('id', editing.id);
      if (error) {
        showToast('Failed to update event.', 'error');
      } else {
        showToast('Event updated successfully.', 'success');
        resetForm();
        loadData();
      }
    } else {
      const { error } = await supabase.from('events').insert({
        title: formData.title,
        type: formData.type,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        created_by: user?.id,
      });
      if (error) {
        showToast('Failed to create event.', 'error');
      } else {
        showToast('Event created successfully.', 'success');
        resetForm();
        loadData();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (event: EventItem) => {
    if (!confirm(`Delete "${event.title}"? This will also remove all registrations for this event.`)) return;
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    if (error) {
      showToast('Failed to delete event.', 'error');
    } else {
      showToast('Event deleted.', 'success');
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Events & Drills</h1>
          <p className="text-sm text-navy-500 mt-1">Create and manage safety programmes and mock exercises.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={resetForm}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-lg">{editing ? 'Edit Event' : 'Create New Event'}</h2>
              <button onClick={resetForm} className="text-navy-400 hover:text-navy-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Earthquake Safety Drill — Sector 12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="input-field"
                >
                  <option value="SSP">School Safety Programme (SSP)</option>
                  <option value="CAP">Community Awareness Programme (CAP)</option>
                  <option value="Mock Drill">Mock Drill Exercise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Community Hall, Sec 12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Brief description of the event..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events table */}
      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No events yet</p>
          <p className="text-sm text-navy-400 mt-1">Create your first event to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const regs = regsByEvent.get(event.id) || [];
            return (
              <div key={event.id} className="card p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold text-navy-700 bg-navy-100 px-2.5 py-1 rounded-full">
                        {typeLabels[event.type]}
                      </span>
                      <span className="text-xs font-medium text-navy-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {regs.length} registered
                      </span>
                    </div>
                    <h3 className="font-bold text-navy-900 text-base mb-1.5">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-navy-600">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-navy-400" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-navy-400" />
                        {event.location || 'TBA'}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-navy-500 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(event)} className="p-2 rounded-lg text-navy-500 hover:bg-navy-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(event)} className="p-2 rounded-lg text-emergency-600 hover:bg-emergency-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Registrations */}
                {regs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-navy-100">
                    <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-2">Registrations</p>
                    <div className="flex flex-wrap gap-2">
                      {regs.slice(0, 6).map((reg) => (
                        <span
                          key={reg.id}
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            reg.status === 'attended'
                              ? 'bg-safety-100 text-safety-700'
                              : 'bg-navy-100 text-navy-600'
                          }`}
                        >
                          {reg.qr_code}
                        </span>
                      ))}
                      {regs.length > 6 && (
                        <span className="text-xs text-navy-400 px-2 py-1">+{regs.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
