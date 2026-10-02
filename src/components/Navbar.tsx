import React, { useState, useEffect } from 'react';
import { Anchor, Ship, Navigation, Package, Users, Activity, LogOut, Clock, ChevronDown, Bell, Radio } from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 'dashboard' | 'ships' | 'voyages' | 'cargo' | 'crew' | 'logs';

interface NavbarProps {
  currentUser: User;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  totalAlerts?: number;
  isRealtimeOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  totalAlerts = 0,
  isRealtimeOnline = true,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const wib = now.toLocaleTimeString('id-ID', { hour12: false });
      const date = now.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      setTimeStr(`${date} • ${wib} WIB`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: Activity },
    { id: 'ships', label: 'Armada Kapal', icon: Ship },
    { id: 'voyages', label: 'Jadwal Pelayaran', icon: Navigation },
    { id: 'cargo', label: 'Manifes Kargo (B/L)', icon: Package },
    { id: 'crew', label: 'Awak Kapal (STCW)', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center text-amber-400 shadow-md shadow-slate-900/20 group-hover:scale-105 transition ring-1 ring-amber-400/40">
                <Anchor className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 tracking-wider flex items-center gap-2">
                  <span>JAVARA NUSANTARA</span>
                  <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-amber-500/15 to-amber-500/25 text-amber-900 border border-amber-400/40 rounded-full font-extrabold uppercase tracking-widest">
                    LINES
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium -mt-0.5">
                  Maritime Fleet & Logistics Operating System
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Real-time Indicator, Maritime Clock, Audit Log, User Profile */}
          <div className="flex items-center gap-3">
            {/* Real-time Online Beacon */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Real-Time Online</span>
            </div>

            {/* Maritime Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>{timeStr || 'Loading WIB...'}</span>
            </div>

            {/* Audit Log Button */}
            <button
              onClick={() => setActiveTab('logs')}
              title="Audit Log Real-Time Database"
              className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Audit Log</span>
              {totalAlerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.fullName.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  onMouseLeave={() => setShowUserMenu(false)}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                      PT JAVARA NUSANTARA TBK
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('logs');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      Log Audit Transaksi Real-Time
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 mt-1 cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
