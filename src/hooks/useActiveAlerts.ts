import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Alert } from '@/types/database';

export function useActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('active_status', true)
        .order('created_at', { ascending: false });
      setAlerts((data as Alert[]) || []);
    }

    fetchAlerts();

    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, fetchAlerts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return alerts;
}
