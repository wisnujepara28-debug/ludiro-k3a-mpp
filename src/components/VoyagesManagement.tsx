import React, { useState } from 'react';
import {
  Navigation,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Ship,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  Fuel,
  Package,
} from 'lucide-react';
import { Voyage as VoyageType, Ship as ShipType, VoyageStatus } from '../types';

interface VoyagesManagementProps {
  voyages: VoyageType[];
  ships: ShipType[];
  onCreateVoyage: (data: Partial<VoyageType>) => Promise<boolean>;
  onUpdateVoyage: (id: string, data: Partial<VoyageType>) => Promise<boolean>;
  onDeleteVoyage: (id: string) => Promise<boolean>;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const VoyagesManagement: React.FC<VoyagesManagementProps> = ({
  voyages,
  ships,
  onCreateVoyage,
  onUpdateVoyage,
  onDeleteVoyage,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(isModalOpenExternal);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageType | null>(null);
  const [deleteConfirmVoyage, setDeleteConfirmVoyage] = useState<VoyageType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isModalOpenExternal) {
      setFormMode('create');
      setSelectedVoyage(null);
      setFormData(initialFormData);
      setIsFormOpen(true);
    }
  }, [isModalOpenExternal]);

  const defaultShip = ships[0] || { id: '', name: '' };

  const initialFormData = {
    voyageNumber: `VYG-2026-RT-${Math.floor(100 + Math.random() * 900)}`,
    shipId: defaultShip.id,
    portOfLoading: 'Tanjung Priok, Jakarta',
    portOfDischarge: 'Tanjung Perak, Surabaya',
    departureTime: new Date(Date.now() + 3600 * 1000 * 12).toISOString().slice(0, 16),
    estimatedArrival: new Date(Date.now() + 3600 * 1000 * 60).toISOString().slice(0, 16),
    status: 'Scheduled' as VoyageStatus,
    capacityUsagePct: 85,
    cargoTonnage: 28000,
    totalTeu: 1800,
    bunkerFuelMt: 320,
    remarks: 'Pelayaran reguler tol laut logistik nasional.',
  };

  const [formData, setFormData] = useState(initialFormData);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedVoyage(null);
    setFormData({
      ...initialFormData,
      voyageNumber: `VYG-2026-RT-${Math.floor(100 + Math.random() * 900)}`,
      shipId: ships[0]?.id || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (v: VoyageType) => {
    setFormMode('edit');
    setSelectedVoyage(v);
    setFormData({
      voyageNumber: v.voyageNumber,
      shipId: v.shipId,
      portOfLoading: v.portOfLoading,
      portOfDischarge: v.portOfDischarge,
      departureTime: v.departureTime ? v.departureTime.slice(0, 16) : '',
      estimatedArrival: v.estimatedArrival ? v.estimatedArrival.slice(0, 16) : '',
      status: v.status as VoyageStatus,
      capacityUsagePct: v.capacityUsagePct,
      cargoTonnage: v.cargoTonnage,
      totalTeu: v.totalTeu,
      bunkerFuelMt: v.bunkerFuelMt,
      remarks: v.remarks || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.voyageNumber.trim() || formData.voyageNumber.trim().length < 4) {
      errs.voyageNumber = 'Nomor pelayaran wajib diisi minimal 4 karakter.';
    }

    if (!formData.shipId) {
      errs.shipId = 'Pilih kapal yang akan ditugaskan.';
    }

    if (!formData.portOfLoading.trim()) {
      errs.portOfLoading = 'Pelabuhan muat (keberangkatan) wajib diisi.';
    }

    if (!formData.portOfDischarge.trim()) {
      errs.portOfDischarge = 'Pelabuhan bongkar (tujuan) wajib diisi.';
    }

    if (
      formData.portOfLoading.trim().toLowerCase() ===
      formData.portOfDischarge.trim().toLowerCase()
    ) {
      errs.portOfDischarge = 'Pelabuhan asal dan pelabuhan tujuan tidak boleh sama.';
    }

    if (!formData.departureTime || !formData.estimatedArrival) {
      errs.departureTime = 'Jadwal ETD dan ETA wajib diisi.';
    } else if (new Date(formData.departureTime) >= new Date(formData.estimatedArrival)) {
      errs.estimatedArrival = 'Waktu tiba (ETA) harus setelah waktu keberangkatan (ETD).';
    }

    if (formData.cargoTonnage < 0) {
      errs.cargoTonnage = 'Tonase kargo tidak boleh bernilai negatif.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (formMode === 'create') {
        const success = await onCreateVoyage(formData);
        if (success) {
          setIsFormOpen(false);
          onCloseExternalModal?.();
        }
      } else if (selectedVoyage) {
        const success = await onUpdateVoyage(selectedVoyage.id, formData);
        if (success) {
          setIsFormOpen(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmVoyage) return;
    setSubmitting(true);
    try {
      const success = await onDeleteVoyage(deleteConfirmVoyage.id);
      if (success) {
        setDeleteConfirmVoyage(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVoyages = voyages.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      v.voyageNumber.toLowerCase().includes(q) ||
      v.shipName.toLowerCase().includes(q) ||
      v.portOfLoading.toLowerCase().includes(q) ||
      v.portOfDischarge.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-600" />
            Jadwal Pelayaran & Rute Logistik (Voyages)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola jadwal keberangkatan kapal (ETD), estimasi kedatangan (ETA), pelabuhan bongkar muat, dan bunker bahan bakar.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Jadwal Pelayaran
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor pelayaran, kapal, pelabuhan muat, atau tujuan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Pelayaran</option>
            <option value="Scheduled">Terjadwal (Scheduled)</option>
            <option value="In Progress">Dalam Perjalanan (In Progress)</option>
            <option value="Arrived">Tiba di Pelabuhan (Arrived)</option>
            <option value="Completed">Selesai (Completed)</option>
            <option value="Delayed">Ditunda (Delayed)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nomor Pelayaran</th>
                <th className="py-3 px-4">Kapal Pengangkut</th>
                <th className="py-3 px-4">Rute (Muat → Bongkar)</th>
                <th className="py-3 px-4">Jadwal (ETD / ETA)</th>
                <th className="py-3 px-4">Muatan & Utilisasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoyages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Navigation className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada jadwal pelayaran ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Terbitkan Jadwal Pelayaran" untuk membuat baru.</p>
                  </td>
                </tr>
              ) : (
                filteredVoyages.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition group">
                    {/* Voyage Number */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {v.voyageNumber}
                    </td>

                    {/* Ship */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {v.shipName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Bunker: {v.bunkerFuelMt} MT
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <span>{v.portOfLoading}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-blue-800 font-semibold">{v.portOfDischarge}</span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">
                        <span className="text-[10px] text-slate-400 block">ETD:</span>
                        {new Date(v.departureTime).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-slate-900 font-semibold mt-1">
                        <span className="text-[10px] text-slate-400 block">ETA:</span>
                        {new Date(v.estimatedArrival).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Cargo & Utilization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, v.capacityUsagePct)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800">{v.capacityUsagePct}%</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {v.cargoTonnage.toLocaleString('id-ID')} MT
                        {v.totalTeu > 0 && ` • ${v.totalTeu} TEU`}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          v.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'Scheduled'
                            ? 'bg-amber-100 text-amber-800'
                            : v.status === 'Arrived'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'Completed'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.status === 'In Progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping mr-1"></span>
                        )}
                        {v.status}
                      </span>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(v)}
                          title="Ubah Jadwal Pelayaran"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmVoyage(v)}
                          title="Hapus Jadwal"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredVoyages.length} jadwal pelayaran</span>
          <span className="font-medium text-slate-600">Sinkronisasi Database Aktif</span>
        </div>
      </div>

      {/* CREATE / EDIT VOYAGE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formMode === 'create' ? 'Terbitkan Jadwal Pelayaran Baru' : `Perbarui Pelayaran: ${selectedVoyage?.voyageNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tentukan rute pelayaran, kapal bertugas, dan estimasi waktu operasional.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  onCloseExternalModal?.();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Voyage Number */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Pelayaran (Voyage Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.voyageNumber}
                    onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value.toUpperCase() })}
                    placeholder="VYG-2026-JKT-SBY-01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.voyageNumber && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.voyageNumber}</p>
                  )}
                </div>

                {/* Ship Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapal Armada Ditugaskan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.shipId}
                    onChange={(e) => setFormData({ ...formData, shipId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">-- Pilih Kapal Armada --</option>
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type} - {s.status})
                      </option>
                    ))}
                  </select>
                  {formErrors.shipId && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.shipId}</p>
                  )}
                </div>

                {/* Port of Loading */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelabuhan Muat (Port of Loading) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.portOfLoading}
                    onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                    placeholder="Contoh: Tanjung Priok, Jakarta"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.portOfLoading && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.portOfLoading}</p>
                  )}
                </div>

                {/* Port of Discharge */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelabuhan Bongkar (Port of Discharge) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.portOfDischarge}
                    onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                    placeholder="Contoh: Tanjung Perak, Surabaya"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.portOfDischarge && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.portOfDischarge}</p>
                  )}
                </div>

                {/* Departure Time (ETD) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Waktu Keberangkatan (ETD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.departureTime && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.departureTime}</p>
                  )}
                </div>

                {/* Arrival Time (ETA) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimasi Kedatangan (ETA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedArrival}
                    onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.estimatedArrival && (
                    <p className="text-rose-600 font-medium mt-1">{formErrors.estimatedArrival}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Pelayaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VoyageStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Scheduled">Terjadwal (Scheduled)</option>
                    <option value="In Progress">Dalam Perjalanan (In Progress)</option>
                    <option value="Arrived">Tiba di Pelabuhan (Arrived)</option>
                    <option value="Completed">Selesai (Completed)</option>
                    <option value="Delayed">Ditunda Cuaca / Alur (Delayed)</option>
                  </select>
                </div>

                {/* Capacity Usage % */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Persentase Muatan: <span className="text-blue-700">{formData.capacityUsagePct}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.capacityUsagePct}
                    onChange={(e) => setFormData({ ...formData, capacityUsagePct: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Cargo Tonnage */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tonase Muatan (Gross Metric Tons)
                  </label>
                  <input
                    type="number"
                    value={formData.cargoTonnage}
                    onChange={(e) => setFormData({ ...formData, cargoTonnage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Bunker Fuel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cadangan Bunker Bahan Bakar (MT)
                  </label>
                  <input
                    type="number"
                    value={formData.bunkerFuelMt}
                    onChange={(e) => setFormData({ ...formData, bunkerFuelMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Rute & Koordinasi Pandu Laut
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Instruksi rute pelayaran, kondisi draft alur sungai, atau koordinat checkpoint..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    onCloseExternalModal?.();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : formMode === 'create' ? 'Terbitkan Jadwal' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmVoyage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Jadwal Pelayaran
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan dan menghapus jadwal pelayaran <span className="font-bold text-slate-900">{deleteConfirmVoyage.voyageNumber}</span> ({deleteConfirmVoyage.shipName})?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmVoyage(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition cursor-pointer"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
