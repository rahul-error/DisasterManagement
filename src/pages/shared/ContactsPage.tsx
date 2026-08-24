import { useEffect, useState } from 'react';
import { Phone, Loader2, Shield, Siren, HeartPulse, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { EmergencyContact } from '@/types/database';

const contactIcons: Record<string, typeof Phone> = {
  Police: Shield,
  Ambulance: HeartPulse,
  'Fire Brigade': Flame,
  'NDRF Helpline': Siren,
  'SDRF Control Room': Siren,
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('emergency_contacts').select('*').order('name');
      setContacts((data as EmergencyContact[]) || []);
      setLoading(false);
    }
    load();
  }, []);

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
        <h1 className="text-2xl font-bold text-navy-900">Emergency Contacts</h1>
        <p className="text-sm text-navy-500 mt-1">Tap any number to call directly. Available 24/7.</p>
      </div>

      {/* Emergency call banner */}
      <div className="card bg-emergency-600 text-white p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Phone className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-base">In an emergency, call 112</h2>
          <p className="text-sm text-emergency-100">The national emergency number connects to all services.</p>
        </div>
        <a
          href="tel:112"
          className="bg-white text-emergency-600 font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-emergency-50 transition-colors shrink-0"
        >
          Call 112
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contacts.map((contact) => {
          const Icon = contactIcons[contact.name] || Phone;
          return (
            <div key={contact.id} className="card p-5 flex items-center gap-4 animate-fade-in hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-sm">{contact.name}</h3>
                <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{contact.description}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="flex flex-col items-center gap-1 bg-emergency-50 hover:bg-emergency-100 text-emergency-700 px-4 py-3 rounded-lg transition-colors shrink-0"
              >
                <Phone className="w-4 h-4" />
                <span className="font-bold text-sm">{contact.phone}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
