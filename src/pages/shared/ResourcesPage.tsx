import { useEffect, useState } from 'react';
import { Search, Download, Loader2, BookOpen, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/types/database';

const disasterIcons: Record<string, string> = {
  Earthquake: '🏔️',
  Flood: '🌊',
  Fire: '🔥',
};

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('resources').select('*').order('disaster_type');
      setResources((data as Resource[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = resources.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.disaster_type.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.dos.some((d) => d.toLowerCase().includes(q)) ||
      r.donts.some((d) => d.toLowerCase().includes(q))
    );
  });

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
        <h1 className="text-2xl font-bold text-navy-900">Resource Hub</h1>
        <p className="text-sm text-navy-500 mt-1">Do's and Don'ts for common disasters. Stay informed to stay safe.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Search for disasters, keywords..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No resources found</p>
          <p className="text-sm text-navy-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((resource) => (
            <div key={resource.id} className="card overflow-hidden animate-fade-in">
              {/* Card header */}
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{disasterIcons[resource.disaster_type] || '📋'}</span>
                  <div>
                    <h3 className="font-bold text-base">{resource.disaster_type}</h3>
                    <p className="text-xs text-navy-300">{resource.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const text = `${resource.title}\n\nDO'S:\n${resource.dos.map((d) => `• ${d}`).join('\n')}\n\nDON'TS:\n${resource.donts.map((d) => `• ${d}`).join('\n')}`;
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${resource.disaster_type}-safety.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Download as text file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Card body */}
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-safety-700 mb-3">
                    <Check className="w-4 h-4" />
                    DO'S
                  </h4>
                  <ul className="space-y-2">
                    {resource.dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-navy-700 leading-relaxed">
                        <span className="text-safety-500 mt-0.5 shrink-0">•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-emergency-700 mb-3">
                    <X className="w-4 h-4" />
                    DON'TS
                  </h4>
                  <ul className="space-y-2">
                    {resource.donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-navy-700 leading-relaxed">
                        <span className="text-emergency-500 mt-0.5 shrink-0">•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
