import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, Siren, BookOpen, Phone, Users, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Users },
  { to: '/admin/events', label: 'Events & Drills', icon: CalendarDays },
  { to: '/admin/alerts', label: 'Alerts', icon: Siren },
  { to: '/admin/resources', label: 'Resources', icon: BookOpen },
  { to: '/admin/contacts', label: 'Contacts', icon: Phone },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-9 h-9 rounded-lg bg-emergency-600 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm">DisasterReady</h1>
          <p className="text-[10px] text-navy-400">Agency Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emergency-600 text-white'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-800 pt-3 space-y-3">
        <div className="px-3 py-2 rounded-lg bg-navy-800/50">
          <p className="text-xs text-navy-400">Signed in as</p>
          <p className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</p>
          <p className="text-[10px] text-emergency-400 mt-0.5">Agency Administrator</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-white p-4 sticky top-0 h-screen shrink-0">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-navy-900 text-white p-4 flex flex-col animate-slide-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-navy-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-navy-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-1 -ml-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emergency-400" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
