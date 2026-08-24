import { useEffect, useState, FormEvent } from 'react';
import { Plus, Loader2, Trash2, Edit2, X, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { EmergencyContact } from '@/types/database';

export function AdminContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('emergency_contacts').select('*').order('name');
    setContacts((data as EmergencyContact[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', phone: '', description: '' });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (c: EmergencyContact) => {
    setEditing(c);
    setFormData({ name: c.name, phone: c.phone, description: c.description });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('emergency_contacts').update(formData).eq('id', editing.id);
      if (error) {
        showToast('Failed to update contact.', 'error');
      } else {
        showToast('Contact updated.', 'success');
        resetForm();
        load();
      }
    } else {
      const { error } = await supabase.from('emergency_contacts').insert(formData);
      if (error) {
        showToast('Failed to add contact.', 'error');
      } else {
        showToast('Contact added.', 'success');
        resetForm();
        load();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (c: EmergencyContact) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', c.id);
    if (error) {
      showToast('Failed to delete contact.', 'error');
    } else {
      showToast('Contact deleted.', 'success');
      load();
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
          <h1 className="text-2xl font-bold text-navy-900">Emergency Contacts</h1>
          <p className="text-sm text-navy-500 mt-1">Manage emergency numbers visible to citizens.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Contact</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={resetForm}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-lg">{editing ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={resetForm} className="text-navy-400 hover:text-navy-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g. Police" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Phone Number</label>
                <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" placeholder="e.g. 100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[60px] resize-y" placeholder="Brief description of the service" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <Phone className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No contacts yet</p>
          <p className="text-sm text-navy-400 mt-1">Add emergency numbers for citizens.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="card p-5 flex items-center gap-4 animate-fade-in">
              <div className="w-11 h-11 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-sm">{c.name}</h3>
                <p className="text-lg font-bold text-emergency-600">{c.phone}</p>
                {c.description && <p className="text-xs text-navy-500 mt-0.5 line-clamp-1">{c.description}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-navy-500 hover:bg-navy-100"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c)} className="p-2 rounded-lg text-emergency-600 hover:bg-emergency-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
