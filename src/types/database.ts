export type UserRole = 'citizen' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  pin_code: string;
  created_at: string;
}

export type EventType = 'SSP' | 'CAP' | 'Mock Drill';

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

export type RegistrationStatus = 'registered' | 'attended';

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  qr_code: string;
  created_at: string;
}

export type AlertSeverity = 'low' | 'high' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  active_status: boolean;
  created_by: string | null;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  created_at: string;
}

export interface Resource {
  id: string;
  disaster_type: string;
  title: string;
  dos: string[];
  donts: string[];
  created_at: string;
}
