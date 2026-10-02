import React from 'react';
import {
  Ship,
  Navigation,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Waves,
  Compass,
  CheckCircle2,
  PlusCircle,
  MapPin,
  Radio,
  Sparkles,
} from 'lucide-react';
import { SystemStats, Ship as ShipType, Voyage as VoyageType, Cargo as CargoType, Crew as CrewType } from '../types';
import { ActiveTab } from './Navbar';

interface DashboardOverviewProps {
  stats: SystemStats | null;
  ships: ShipType[];
  voyages: VoyageType[];
  cargo: CargoType[];
  crew: CrewType[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddShip: () => void;
  onOpenAddVoyage: () => void;
  onOpenAddCargo: () => void;
  onOpenAddCrew: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  ships,
  voyages,
  cargo,
  crew,
  setActiveTab,
  onOpenAddShip,
  onOpenAddVoyage,
  onOpenAddCargo,
  onOpenAddCrew,
}) => {
  const underwayShips = ships.filter((s) => s.status === 'Underway');
  const berthedShips = ships.filter((s) => s.status === 'Berthed');
  const drydockShips = ships.filter((s) => s.status === 'Drydock');
  const activeVoyages = voyages.filter((v) => v.status === 'In Progress');
  const expiringCerts = crew.filter((c) => c.certStatus === 'Expiring Soon' || c.certStatus === 'Expired');

  return (
    <div className="space-y-6">
      {/* Top Banner & Command Center */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/15 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Ship className="w-80 h-80 stroke-1 transform translate-x-12 translate-y-6 text-amber-300" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            JAVARA NUSANTARA • Pusat Komando Armada Real-Time
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Sistem Pemantauan Armada Laut Terpadu
          </h2>
          <p className="mt-2.5 text-slate-300 text-sm leading-relaxed">
            Terhubung langsung secara real-time ke database pusat PT Javara Nusantara Tbk. Seluruh pembaruan posisi kapal, jadwal pelayaran, kargo B/L, dan kualifikasi awak kapal tersinkronisasi otomatis untuk semua pengguna online.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenAddShip}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              + Registrasi Kapal Baru
            </button>
            <button
              onClick={onOpenAddVoyage}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              + Terbitkan Jadwal Pelayaran
            </button>
            <button
              onClick={onOpenAddCargo}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Package className="w-4 h-4 text-amber-400" />
              + Terbitkan Manifes B/L
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Armada */}
        <div
          onClick={() => setActiveTab('ships')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Armada Javara
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats?.totalShips ?? ships.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Unit Kapal</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {underwayShips.length} Berlayar
            </span>
            <span className="text-slate-500 font-medium">
              {drydockShips.length} Perawatan Dok
            </span>
          </div>
        </div>

        {/* Card 2: Pelayaran Berlangsung */}
        <div
          onClick={() => setActiveTab('voyages')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Pelayaran Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {activeVoyages.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Sedang Berjalan</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-bold">
              {voyages.filter((v) => v.status === 'Scheduled').length} Terjadwal
            </span>
            <span className="text-slate-500 font-medium">Tol Laut Koridor</span>
          </div>
        </div>

        {/* Card 3: Tonase Kargo */}
        <div
          onClick={() => setActiveTab('cargo')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Tonase Kargo
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats?.totalCargoTonnage ? stats.totalCargoTonnage.toLocaleString('id-ID') : '112.500'}
            </span>
            <span className="text-xs font-semibold text-slate-500">MT</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-bold">
              {cargo.length} Manifes B/L
            </span>
            <span className="text-slate-500 font-medium">Peti Kemas & Curah</span>
          </div>
        </div>

        {/* Card 4: Awak Kapal STCW */}
        <div
          onClick={() => setActiveTab('crew')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Awak Kapal (STCW)
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats?.totalCrew ?? crew.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Perwira & Pelaut</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {expiringCerts.length > 0 ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {expiringCerts.length} Perlu Pembaruan
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Semua Sertifikat Valid
              </span>
            )}
            <span className="text-slate-500 font-medium">IMO Standards</span>
          </div>
        </div>
      </div>

      {/* Grid: Active Voyages Live Board & Real-Time Maritime Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Voyages Board */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-700" />
                Pelayaran Kapal Berjalan & Tracking ETA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Status rute pelayaran armada PT Javara Nusantara Tbk yang diperbarui secara langsung
              </p>
            </div>
            <button
              onClick={() => setActiveTab('voyages')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold rounded-l-lg">No. Pelayaran</th>
                  <th className="py-2.5 px-3 font-bold">Kapal Javara</th>
                  <th className="py-2.5 px-3 font-bold">Rute</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Muatan</th>
                  <th className="py-2.5 px-3 font-bold rounded-r-lg text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voyages.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                      {v.voyageNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{v.shipName}</div>
                      <div className="text-[11px] text-slate-400">Bunker: {v.bunkerFuelMt} MT</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{v.portOfLoading}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-blue-800">{v.portOfDischarge}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          v.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'Scheduled'
                            ? 'bg-amber-100 text-amber-800'
                            : v.status === 'Arrived'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {v.status === 'In Progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping mr-1"></span>
                        )}
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, v.capacityUsagePct)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700">{v.capacityUsagePct}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {v.cargoTonnage.toLocaleString('id-ID')} MT
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {new Date(v.estimatedArrival).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Real-time Maritime Weather & Port Traffic */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-sky-600" />
              Kondisi Alur Laut & Cuaca Maritim
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Selat Sunda & Laut Jawa</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px]">
                    Kondisi Hijau
                  </span>
                </div>
                <p className="mt-1 text-emerald-800/90 text-[11px] leading-relaxed">
                  Tinggi gelombang 0.75 - 1.25 m. Kecepatan angin 10 - 15 knot barat daya. Aman untuk pelayaran seluruh tipe kapal Javara Nusantara.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Selat Makassar & Perairan Kalimantan</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px]">
                    Waspada Alur
                  </span>
                </div>
                <p className="mt-1 text-amber-800/90 text-[11px] leading-relaxed">
                  Gelombang sedang 1.5 - 2.0 m. Tugboat dan kapal curah batubara dihimbau kurangi kecepatan dan cek lashing muatan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-sky-900">
                  <span>Pelabuhan Tanjung Priok (JKT)</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-200 text-sky-800 text-[10px]">
                    Lancar 24 Jam
                  </span>
                </div>
                <p className="mt-1 text-sky-800/90 text-[11px] leading-relaxed">
                  Dermaga JICT waktu tunggu pandu laut 40 menit. Operasional bongkar muat kontainer Javara Nusantara lancar.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Ship Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Distribusi Status Armada ({ships.length} Kapal)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Underway (Berlayar di Laut)
                </span>
                <span className="font-bold text-slate-900">{underwayShips.length} Kapal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Berthed (Sandar di Dermaga)
                </span>
                <span className="font-bold text-slate-900">{berthedShips.length} Kapal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Anchored (Labuh Jangkar)
                </span>
                <span className="font-bold text-slate-900">
                  {ships.filter((s) => s.status === 'Anchored').length} Kapal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Drydock (Pemeliharaan Dok)
                </span>
                <span className="font-bold text-slate-900">{drydockShips.length} Kapal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
