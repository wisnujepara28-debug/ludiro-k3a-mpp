/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  User,
  Ship,
  Voyage,
  Cargo,
  Crew,
  ActivityLog,
  SystemStats,
  ToastNotification,
} from './types';
import { LoginView } from './components/LoginView';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ShipsManagement } from './components/ShipsManagement';
import { VoyagesManagement } from './components/VoyagesManagement';
import { CargoManagement } from './components/CargoManagement';
import { CrewManagement } from './components/CrewManagement';
import { AuditLogsView } from './components/AuditLogsView';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application Data from Real Server Database
  const [ships, setShips] = useState<Ship[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isRealtimeOnline, setIsRealtimeOnline] = useState(true);

  // External trigger modal states
  const [isAddShipModalOpen, setIsAddShipModalOpen] = useState(false);
  const [isAddVoyageModalOpen, setIsAddVoyageModalOpen] = useState(false);
  const [isAddCargoModalOpen, setIsAddCargoModalOpen] = useState(false);
  const [isAddCrewModalOpen, setIsAddCrewModalOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all primary records from server database
  const loadDatabase = useCallback(async () => {
    setLoadingData(true);
    try {
      const [shipsRes, voyagesRes, cargoRes, crewRes, statsRes, logsRes] = await Promise.all([
        api.getShips(),
        api.getVoyages(),
        api.getCargo(),
        api.getCrew(),
        api.getStats(),
        api.getLogs(),
      ]);

      if (shipsRes.success) setShips(shipsRes.data);
      if (voyagesRes.success) setVoyages(voyagesRes.data);
      if (cargoRes.success) setCargo(cargoRes.data);
      if (crewRes.success) setCrew(crewRes.data);
      if (statsRes.success) setStats(statsRes.stats);
      if (logsRes.success) setLogs(logsRes.logs);
      setIsRealtimeOnline(true);
    } catch (err: any) {
      console.error('Error fetching data from database:', err);
      setIsRealtimeOnline(false);
      showToast('error', 'Gagal Sinkronisasi Database', err.message || 'Periksa koneksi server.');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.checkAuth();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          await loadDatabase();
        }
      } catch (e) {
        // Not authenticated, default to login view
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    initAuth();
  }, [loadDatabase]);

  // Real-Time Event Subscription (Server-Sent Events)
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = api.subscribeToEvents((event) => {
      // Refresh current data immediately when any mutation occurs across clients
      loadDatabase();
      if (event?.payload?.entity) {
        showToast(
          'info',
          'Pembaruan Real-Time',
          `Data ${event.payload.entity} diperbarui secara langsung oleh pengguna lain.`
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, loadDatabase, showToast]);

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    await loadDatabase();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari Javara Nusantara.');
    } finally {
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  // ---------------- SHIP CRUD HANDLERS ----------------
  const handleCreateShip = async (data: Partial<Ship>): Promise<boolean> => {
    try {
      const res = await api.createShip(data, currentUser?.fullName);
      showToast('success', 'Kapal Berhasil Didaftarkan', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Registrasi Kapal', err.message);
      return false;
    }
  };

  const handleUpdateShip = async (id: string, data: Partial<Ship>): Promise<boolean> => {
    try {
      const res = await api.updateShip(id, data, currentUser?.fullName);
      showToast('success', 'Data Kapal Diperbarui', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Memperbarui Kapal', err.message);
      return false;
    }
  };

  const handleDeleteShip = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteShip(id);
      showToast('success', 'Kapal Dihapus', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus Kapal', err.message);
      return false;
    }
  };

  // ---------------- VOYAGE CRUD HANDLERS ----------------
  const handleCreateVoyage = async (data: Partial<Voyage>): Promise<boolean> => {
    try {
      const res = await api.createVoyage(data, currentUser?.fullName);
      showToast('success', 'Jadwal Pelayaran Diterbitkan', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Menerbitkan Jadwal', err.message);
      return false;
    }
  };

  const handleUpdateVoyage = async (id: string, data: Partial<Voyage>): Promise<boolean> => {
    try {
      const res = await api.updateVoyage(id, data, currentUser?.fullName);
      showToast('success', 'Jadwal Diperbarui', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Mengubah Jadwal', err.message);
      return false;
    }
  };

  const handleDeleteVoyage = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteVoyage(id);
      showToast('success', 'Jadwal Dihapus', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus Jadwal', err.message);
      return false;
    }
  };

  // ---------------- CARGO CRUD HANDLERS ----------------
  const handleCreateCargo = async (data: Partial<Cargo>): Promise<boolean> => {
    try {
      const res = await api.createCargo(data, currentUser?.fullName);
      showToast('success', 'Manifes B/L Diterbitkan', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Membuat B/L', err.message);
      return false;
    }
  };

  const handleUpdateCargo = async (id: string, data: Partial<Cargo>): Promise<boolean> => {
    try {
      const res = await api.updateCargo(id, data, currentUser?.fullName);
      showToast('success', 'Manifes B/L Diperbarui', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Mengubah B/L', err.message);
      return false;
    }
  };

  const handleDeleteCargo = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteCargo(id);
      showToast('success', 'Manifes Kargo Dihapus', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus B/L', err.message);
      return false;
    }
  };

  // ---------------- CREW CRUD HANDLERS ----------------
  const handleCreateCrew = async (data: Partial<Crew>): Promise<boolean> => {
    try {
      const res = await api.createCrew(data, currentUser?.fullName);
      showToast('success', 'Awak Kapal Didaftarkan', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Mendaftarkan Awak', err.message);
      return false;
    }
  };

  const handleUpdateCrew = async (id: string, data: Partial<Crew>): Promise<boolean> => {
    try {
      const res = await api.updateCrew(id, data, currentUser?.fullName);
      showToast('success', 'Data Awak Diperbarui', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Mengubah Data Awak', err.message);
      return false;
    }
  };

  const handleDeleteCrew = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteCrew(id);
      showToast('success', 'Awak Kapal Dihapus', res.message);
      await loadDatabase();
      return true;
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus Awak', err.message);
      return false;
    }
  };

  // Initial loading
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-200">Menghubungkan ke Server Real-Time Javara Nusantara...</p>
        </div>
      </div>
    );
  }

  // 1. DEFAULT VIEW: Form Login
  if (!currentUser) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 2. AUTHENTICATED REAL-TIME WORKSPACE
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif]">
      {/* Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        totalAlerts={stats?.expiringCerts || 0}
        isRealtimeOnline={isRealtimeOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            ships={ships}
            voyages={voyages}
            cargo={cargo}
            crew={crew}
            setActiveTab={setActiveTab}
            onOpenAddShip={() => {
              setActiveTab('ships');
              setIsAddShipModalOpen(true);
            }}
            onOpenAddVoyage={() => {
              setActiveTab('voyages');
              setIsAddVoyageModalOpen(true);
            }}
            onOpenAddCargo={() => {
              setActiveTab('cargo');
              setIsAddCargoModalOpen(true);
            }}
            onOpenAddCrew={() => {
              setActiveTab('crew');
              setIsAddCrewModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ships' && (
          <ShipsManagement
            ships={ships}
            onCreateShip={handleCreateShip}
            onUpdateShip={handleUpdateShip}
            onDeleteShip={handleDeleteShip}
            isModalOpenExternal={isAddShipModalOpen}
            onCloseExternalModal={() => setIsAddShipModalOpen(false)}
          />
        )}

        {activeTab === 'voyages' && (
          <VoyagesManagement
            voyages={voyages}
            ships={ships}
            onCreateVoyage={handleCreateVoyage}
            onUpdateVoyage={handleUpdateVoyage}
            onDeleteVoyage={handleDeleteVoyage}
            isModalOpenExternal={isAddVoyageModalOpen}
            onCloseExternalModal={() => setIsAddVoyageModalOpen(false)}
          />
        )}

        {activeTab === 'cargo' && (
          <CargoManagement
            cargo={cargo}
            voyages={voyages}
            onCreateCargo={handleCreateCargo}
            onUpdateCargo={handleUpdateCargo}
            onDeleteCargo={handleDeleteCargo}
            isModalOpenExternal={isAddCargoModalOpen}
            onCloseExternalModal={() => setIsAddCargoModalOpen(false)}
          />
        )}

        {activeTab === 'crew' && (
          <CrewManagement
            crew={crew}
            ships={ships}
            onCreateCrew={handleCreateCrew}
            onUpdateCrew={handleUpdateCrew}
            onDeleteCrew={handleDeleteCrew}
            isModalOpenExternal={isAddCrewModalOpen}
            onCloseExternalModal={() => setIsAddCrewModalOpen(false)}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogsView logs={logs} onRefresh={loadDatabase} />
        )}
      </main>

      {/* Global Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
