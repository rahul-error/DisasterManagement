import { useEffect, useState, FormEvent } from 'react';
import { Plus, Loader2, Trash2, Edit2, X, Check, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { Resource } from '@/types/database';

const defaultDisasters = ['Earthquake', 'Flood', 'Fire', 'Cyclone', 'Landslide', 'Tsunami'];

export function AdminResourcesPage() {
  const { showToast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    disaster_type: '',
    title: '',
    dos: [''],
    donts: [''],
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('resources').select('*').order('disaster_type');
    setResources((data as Resource[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormData({ disaster_type: '', title: '', dos: [''], donts: [''] });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (r: Resource) => {
    setEditing(r);
    setFormData({
      disaster_type: r.disaster_type,
      title: r.title,
      dos: r.dos.length ? r.dos : [''],
      donts: r.donts.length ? r.donts : [''],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      disaster_type: formData.disaster_type,
      title: formData.title,
      dos: formData.dos.filter((d) => d.trim()),
      donts: formData.donts.filter((d) => d.trim()),
    };

    if (editing) {
      const { error } = await supabase.from('resources').update(payload).eq('id', editing.id);
      if (error) {
        showToast('Failed to update resource.', 'error');
      } else {
        showToast('Resource updated.', 'success');
        resetForm();
        load();
      }
    } else {
      const { error } = await supabase.from('resources').insert(payload);
      if (error) {
        showToast('Failed to create resource.', 'error');
      } else {
        showToast('Resource created.', 'success');
        resetForm();
        load();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (r: Resource) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await supabase.from('resources').delete().eq('id', r.id);
    if (error) {
      showToast('Failed to delete resource.', 'error');
    } else {
      showToast('Resource deleted.', 'success');
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
          <h1 className="text-2xl font-bold text-navy-900">Resource Hub</h1>
          <p className="text-sm text-navy-500 mt-1">Manage disaster safety datasheets available to citizens.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Resource</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={resetForm}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-lg">{editing ? 'Edit Resource' : 'New Resource'}</h2>
              <button onClick={resetForm} className="text-navy-400 hover:text-navy-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Disaster Type</label>
                <input
                  type="text"
                  required
                  list="disaster-types"
                  value={formData.disaster_type}
                  onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Earthquake"
                />
                <datalist id="disaster-types">
                  {defaultDisasters.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Earthquake Safety — Do's and Don'ts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-safety-700 mb-2">Do's</label>
                <div className="space-y-2">
                  {formData.dos.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => {
                          const dos = [...formData.dos];
                          dos[i] = e.target.value;
                          setFormData({ ...formData, dos });
                        }}
                        className="input-field"
                        placeholder="Add a 'Do' instruction"
                      />
                      {formData.dos.length > 1 && (
                        <button type="button" onClick={() => setFormData({ ...formData, dos: formData.dos.filter((_, idx) => idx !== i) })} className="p-2 text-navy-400 hover:text-emergency-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData({ ...formData, dos: [...formData.dos, ''] })} className="text-sm text-safety-600 font-medium hover:underline">
                    + Add another Do
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emergency-700 mb-2">Don'ts</label>
                <div className="space-y-2">
                  {formData.donts.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => {
                          const donts = [...formData.donts];
                          donts[i] = e.target.value;
                          setFormData({ ...formData, donts });
                        }}
                        className="input-field"
                        placeholder="Add a 'Don't' instruction"
                      />
                      {formData.donts.length > 1 && (
                        <button type="button" onClick={() => setFormData({ ...formData, donts: formData.donts.filter((_, idx) => idx !== i) })} className="p-2 text-navy-400 hover:text-emergency-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData({ ...formData, donts: [...formData.donts, ''] })} className="text-sm text-emergency-600 font-medium hover:underline">
                    + Add another Don't
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No resources yet</p>
          <p className="text-sm text-navy-400 mt-1">Create safety datasheets for citizens.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((r) => (
            <div key={r.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-bold text-navy-700 bg-navy-100 px-2.5 py-1 rounded-full">{r.disaster_type}</span>
                  <h3 className="font-bold text-navy-900 text-sm mt-2">{r.title}</h3>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg text-navy-500 hover:bg-navy-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r)} className="p-2 rounded-lg text-emergency-600 hover:bg-emergency-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-bold text-safety-700 mb-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Do's ({r.dos.length})</p>
                  <p className="text-navy-500">{r.dos.length} items</p>
                </div>
                <div>
                  <p className="font-bold text-emergency-700 mb-1.5 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Don'ts ({r.donts.length})</p>
                  <p className="text-navy-500">{r.donts.length} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
