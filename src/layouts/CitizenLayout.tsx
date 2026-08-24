import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, BookOpen, Phone, QrCode, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/my-tickets', label: 'Tickets', icon: QrCode },
  { to: '/app/resources', label: 'Resources', icon: BookOpen },
  { to: '/app/contacts', label: 'Contacts', icon: Phone },
];

export function CitizenLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Mobile top bar */}
      <header className="lg:hidden bg-navy-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emergency-400" />
          <span className="font-bold text-sm">DisasterReady</span>
        </div>
        <div className="text-xs text-navy-300 truncate max-w-[120px]">
          {profile?.full_name || 'Citizen'}
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="flex flex-1">
        <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-white p-4 sticky top-0 h-screen">
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-lg bg-emergency-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">DisasterReady</h1>
              <p className="text-[10px] text-navy-400">Citizen Portal</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-800 text-white'
                      : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
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
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Citizen'}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-4xl p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-navy-200 z-40 shadow-lg">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  isActive ? 'text-navy-900' : 'text-navy-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-navy-100' : ''}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-navy-900' : 'text-navy-400'}`} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
